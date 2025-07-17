
import React, { useState, useCallback } from 'react';
import { AnalysisResponse } from './types';
import { analyzeScript } from './services/geminiService';
import Header from './components/Header';
import CodeInput from './components/CodeInput';
import AnalysisResult from './components/AnalysisResult';
import Spinner from './components/Spinner';
import ErrorMessage from './components/ErrorMessage';

const initialScript = `#!/bin/bash

# FFmpeg Universal Transcoder
# Version 4.1 - Added Hardware Acceleration Options
# Features:
# - Hardware encoding support (NVIDIA NVENC, Intel QSV) for high performance
# - Supports UDP, HLS, DASH, RTMP, and file inputs
# - Multiple output format options using a single FFmpeg process (tee muxer)
# - Interactive stream selection that is correctly applied
# - UDP program scanning and selection
# - Logo overlay with positioning options
# - Configuration saving/loading
# - Input validation and error handling
# - Hardened against command injection vulnerabilities

# ----------------------------
# CONFIGURATION SECTION
# ----------------------------

# Configuration file path
CONFIG_FILE="ffmpeg_transcode.conf"

# Default values for all parameters
DEFAULT_INPUT_TYPE="udp"
DEFAULT_INPUT_URL=""
DEFAULT_OUTPUT_FORMAT="udp"
DEFAULT_OUTPUT_URL=""
DEFAULT_VIDEO_CODEC="libx264" # Can be libx264, h264_nvenc, h264_qsv
DEFAULT_AUDIO_CODEC="aac"
DEFAULT_ENCODING_PRESET="veryfast" # Applies to both CPU and GPU encoders
DEFAULT_CRF=23 # Applies only to libx264
DEFAULT_PROGRAM_ID=0
DEFAULT_LOGO_PATH="/home/fida/logo.png"
DEFAULT_LOGO_POSITION="main_w-overlay_w-10:10"
DEFAULT_LOGO_SCALE=200
DEFAULT_LOGO_ENABLED=false

# ----------------------------
# INITIALIZATION SECTION
# ----------------------------

# Initialize all variables
input_type=""
input_url=""
output_format=""
output_url=""
video_codec=""
audio_codec=""
encoding_preset=""
crf=""
selected_program_id=""
logo_path=""
logo_position=""
logo_scale=""
logo_enabled=""
video_stream=""
audio_stream=""
subtitle_stream=""
programs_list=""
streams_json=""
ffmpeg_cmd_array=()

# FIX: Ensure temporary files are cleaned up on exit (Ctrl+C, etc.)
cleanup() {
    echo -e "\\nCleaning up temporary files..."
    rm -f "$programs_list" "$streams_json"
}
trap cleanup EXIT INT TERM

# ----------------------------
# FUNCTION DEFINITIONS
# ----------------------------

# Load configuration from file
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        echo "Loading configuration from $CONFIG_FILE..."
        if source "$CONFIG_FILE"; then
            echo "Configuration loaded successfully."
        else
            echo "Error: Failed to load configuration file (possibly corrupt)"
            return 1
        fi
    else
        echo "No configuration file found at $CONFIG_FILE."
        return 1
    fi
}

# Save current configuration to file
save_config() {
    {
        printf "# FFmpeg Universal Transcoder Configuration\\n"
        printf "# Last updated: %s\\n\\n" "$(date)"
        printf "input_type=\\"%s\\"\\n" "\${input_type:-$DEFAULT_INPUT_TYPE}"
        printf "input_url=\\"%s\\"\\n" "\${input_url:-$DEFAULT_INPUT_URL}"
        printf "output_format=\\"%s\\"\\n" "\${output_format:-$DEFAULT_OUTPUT_FORMAT}"
        printf "output_url=\\"%s\\"\\n" "\${output_url:-$DEFAULT_OUTPUT_URL}"
        printf "video_codec=\\"%s\\"\\n" "\${video_codec:-$DEFAULT_VIDEO_CODEC}"
        printf "audio_codec=\\"%s\\"\\n" "\${audio_codec:-$DEFAULT_AUDIO_CODEC}"
        printf "encoding_preset=\\"%s\\"\\n" "\${encoding_preset:-$DEFAULT_ENCODING_PRESET}"
        printf "crf=%s\\n" "\${crf:-$DEFAULT_CRF}"
        printf "selected_program_id=%s\\n" "\${selected_program_id:-$DEFAULT_PROGRAM_ID}"
        printf "logo_path=\\"%s\\"\\n" "\${logo_path:-$DEFAULT_LOGO_PATH}"
        printf "logo_position=\\"%s\\"\\n" "\${logo_position:-$DEFAULT_LOGO_POSITION}"
        printf "logo_scale=%s\\n" "\${logo_scale:-$DEFAULT_LOGO_SCALE}"
        printf "logo_enabled=%s\\n" "\${logo_enabled:-$DEFAULT_LOGO_ENABLED}"
        printf "video_stream=\\"%s\\"\\n" "\${video_stream:-}"
        printf "audio_stream=\\"%s\\"\\n" "\${audio_stream:-}"
        printf "subtitle_stream=\\"%s\\"\\n" "\${subtitle_stream:-}"
        printf "hls_url=\\"%s\\"\\n" "\${hls_url:-}"
        printf "dash_url=\\"%s\\"\\n" "\${dash_url:-}"
        printf "rtmp_url=\\"%s\\"\\n" "\${rtmp_url:-}"
        printf "udp_url=\\"%s\\"\\n" "\${udp_url:-}"
        printf "file_url=\\"%s\\"\\n" "\${file_url:-}"
    } > "$CONFIG_FILE"

    echo "Configuration saved to $CONFIG_FILE"
}

# Scan available programs from UDP input
scan_udp_programs() {
    echo "Scanning UDP input for available programs..."
    programs_list=$(mktemp)
    
    echo "Analyzing UDP programs, please wait..."
    if ! ffprobe -v error -show_programs -probesize 10M -analyzeduration 10M -print_format json "$input_url" > "$programs_list"; then
        echo "Error: Failed to scan UDP programs."
        return 1
    fi
    
    if ! jq -e '.programs | length > 0' "$programs_list" >/dev/null; then
        echo "No programs found in the UDP stream."
        return 1
    fi
    
    echo -e "\\nAvailable Programs:"
    jq -r '
      "ID  | Service Name                | Streams",
      "----------------------------------------------------------------",
      (.programs[] |
        [
          .program_id,
          .tags.service_name // "Unnamed program",
          "\\(.streams | map(select(.codec_type==\\"video\\")) | length) video, \\(.streams | map(select(.codec_type==\\"audio\\")) | length) audio"
        ] | @tsv
      )' "$programs_list" | column -t -s $'\\t'
    echo "----------------------------------------------------------------"
}

# Select a program from UDP input
select_program() {
    read -p "Enter program ID to transcode (leave blank for automatic): " selected_program_id
    selected_program_id=\${selected_program_id:-0}
    
    if ! jq -e ".programs[] | select(.program_id == $selected_program_id)" "$programs_list" >/dev/null; then
        echo "Warning: Selected program ID not found. Stream selection will be manual or automatic."
        selected_program_id=""
    fi
}

# Validate the current configuration
validate_config() {
    echo "Validating configuration..."
    local valid=true

    if [ -z "$input_url" ]; then echo "Error: Input URL is not set."; valid=false; fi
    if [ -z "$output_url" ] && [ "$output_format" != "multi" ]; then echo "Error: Output URL is not set."; valid=false; fi
    
    if [ "$logo_enabled" = true ]; then
        if [ ! -f "$logo_path" ]; then
            echo "Error: Logo file not found at $logo_path"
            valid=false
        fi
    fi
    
    if $valid; then
        echo "Configuration validation passed."
        return 0
    else
        return 1
    fi
}

# Scan available streams from input
scan_streams() {
    echo "Scanning input streams..."
    streams_json=$(mktemp)
    
    local -a probe_cmd=(ffprobe -v error -show_streams -probesize 10M -analyzeduration 10M -print_format json)
    
    echo "Analyzing streams, please wait..."
    if ! "\${probe_cmd[@]}" "$input_url" > "$streams_json"; then
        echo "Error: Failed to scan input streams."
        return 1
    fi
    
    echo -e "\\nAvailable Streams:"
    echo "----------------------------------------------------------------"
    jq -r '.streams[] | "Stream \\(.index): Type=\\(.codec_type), Codec=\\(.codec_name)" + 
           (if .codec_type == "video" and .width and .height then ", \\(.width)x\\(.height)" else "" end) + 
           (if .tags.language then ", Lang=\\(.tags.language)" else "" end)' "$streams_json"
    echo "----------------------------------------------------------------"
}

# Interactive stream selection
select_streams() {
    echo -e "\\nStream Selection (leave blank for automatic)"
    read -p "Video stream number: " video_stream
    read -p "Audio stream number: " audio_stream
    read -p "Subtitle stream number (optional): " subtitle_stream
}

# Configure logo overlay
configure_logo() {
    read -p "Enable logo overlay? (y/n) [$(if $logo_enabled; then echo 'y'; else echo 'n'; fi)]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        logo_enabled=true
        read -p "Logo file path [$DEFAULT_LOGO_PATH]: " logo_path
        logo_path=\${logo_path:-$DEFAULT_LOGO_PATH}
        read -p "Logo position [$DEFAULT_LOGO_POSITION]: " logo_position
        logo_position=\${logo_position:-$DEFAULT_LOGO_POSITION}
        read -p "Logo width in pixels (0 for original) [$DEFAULT_LOGO_SCALE]: " logo_scale
        logo_scale=\${logo_scale:-$DEFAULT_LOGO_SCALE}
    else
        logo_enabled=false
    fi
}

# Build the FFmpeg command based on current configuration
build_ffmpeg_command() {
    local -a cmd=(ffmpeg -hide_banner -loglevel info -y)

    # --- Input Options ---
    if [ "$input_type" = "udp" ]; then
        cmd+=(-probesize 10M -analyzeduration 10M)
        if [[ ! "$input_url" =~ "fifo_size=" ]]; then
            input_url="\${input_url}?fifo_size=8000000&overrun_nonfatal=1"
        fi
    fi
    cmd+=(-re -i "$input_url")

    # --- Video and Audio Codecs ---
    cmd+=(-c:v "$video_codec")
    case "$video_codec" in
        libx264)
            cmd+=(-preset:v "$encoding_preset" -crf "$crf" -tune zerolatency)
            ;;
        h264_nvenc)
            cmd+=(-preset:v "$encoding_preset" -cq 23 -rc vbr_hq)
            ;;
        h264_qsv)
            cmd+=(-preset:v "$encoding_preset" -global_quality 23)
            ;;
    esac
    cmd+=(-c:a "$audio_codec" -b:a 128k -ac 2)

    # --- Stream Mapping and Filtering ---
    if [ "$logo_enabled" = true ]; then
        cmd+=(-i "$logo_path")
        local filter_string
        if [[ "$logo_scale" -gt 0 ]]; then
            filter_string="[1:v]scale=\${logo_scale}:-1[logo];[0:v][logo]overlay=\${logo_position}"
        else
            filter_string="[0:v][1:v]overlay=\${logo_position}"
        fi
        cmd+=(-filter_complex "$filter_string")
        if [ -n "$audio_stream" ]; then cmd+=(-map "0:$audio_stream"); else cmd+=(-map "0:a:0"); fi
    else
        if [ "$input_type" = "udp" ] && [[ -n "$selected_program_id" && "$selected_program_id" != "0" ]]; then
            cmd+=(-map "0:p:$selected_program_id")
        else
            if [ -n "$video_stream" ]; then cmd+=(-map "0:$video_stream"); else cmd+=(-map "0:v:0"); fi
            if [ -n "$audio_stream" ]; then cmd+=(-map "0:$audio_stream"); else cmd+=(-map "0:a:0"); fi
        fi
    fi
    if [ -n "$subtitle_stream" ]; then
        cmd+=(-map "0:$subtitle_stream" -c:s copy)
    fi

    # --- Output Options ---
    case "$output_format" in
        udp)    cmd+=(-f mpegts "$output_url") ;;
        hls)    cmd+=(-f hls -hls_time 4 -hls_list_size 6 -hls_flags delete_segments "$output_url") ;;
        dash)   cmd+=(-f dash -seg_duration 4 -window_size 15 -extra_window_size 5 "$output_url") ;;
        rtmp)   cmd+=(-f flv "$output_url") ;;
        file)   cmd+=(-f mpegts "$output_url") ;;
        multi)
            local tee_outputs=""
            if [ -n "$hls_url" ];  then tee_outputs+="[f=hls:hls_time=4:hls_list_size=6:hls_flags=delete_segments]\${hls_url}|"; fi
            if [ -n "$dash_url" ]; then tee_outputs+="[f=dash:seg_duration=4]\${dash_url}|"; fi
            if [ -n "$rtmp_url" ]; then tee_outputs+="[f=flv]\${rtmp_url}|"; fi
            if [ -n "$udp_url" ];  then tee_outputs+="[f=mpegts]\${udp_url}|"; fi
            if [ -n "$file_url" ]; then tee_outputs+="[f=mpegts]\${file_url}|"; fi
            tee_outputs="\${tee_outputs%|}"
            cmd+=(-f tee "$tee_outputs")
            ;;
    esac
    
    ffmpeg_cmd_array=("\${cmd[@]}")
}

# ----------------------------
# MAIN PROGRAM
# ----------------------------
check_dependencies() {
    if ! command -v ffmpeg &> /dev/null; then echo "Error: ffmpeg is not installed."; exit 1; fi
    if ! command -v jq &> /dev/null; then echo "Error: jq is not installed."; exit 1; fi
}

clear
echo "========================================"
echo "      FFmpeg Universal Transcoder       "
echo "========================================"
check_dependencies

if ! load_config; then
    echo "Initializing with default values..."
    input_type="$DEFAULT_INPUT_TYPE"
    video_codec="$DEFAULT_VIDEO_CODEC"
    audio_codec="$DEFAULT_AUDIO_CODEC"
    encoding_preset="$DEFAULT_ENCODING_PRESET"
    crf="$DEFAULT_CRF"
    logo_path="$DEFAULT_LOGO_PATH"
    logo_position="$DEFAULT_LOGO_POSITION"
    logo_scale="$DEFAULT_LOGO_SCALE"
    logo_enabled="$DEFAULT_LOGO_ENABLED"
fi

while true; do
    echo -e "\\n--- Main Menu ---"
    echo "1. Configure Input                 (Current: \${input_type} | \${input_url})"
    echo "2. Configure Output                (Current: \${output_format})"
    echo "3. Configure Encoding              (Current: \${video_codec} | Preset: \${encoding_preset})"
    echo "4. Configure Stream Selection"
    echo "5. Configure Logo Overlay          (Current: $(if $logo_enabled; then echo 'Enabled'; else echo 'Disabled'; fi))"
    echo "6. Show Current Configuration"
    echo "7. Save Configuration"
    echo "8. Start Transcoding"
    echo "9. Exit"
    read -p "Select option [1-9]: " main_choice

    case $main_choice in
        1) # Configure Input
            echo -e "\\nInput Type: 1)UDP 2)HLS 3)DASH 4)RTMP 5)File"
            read -p "Select input type [1-5]: " choice
            case $choice in
                1) input_type="udp";; 2) input_type="hls";; 3) input_type="dash";;
                4) input_type="rtmp";; 5) input_type="file";; *) echo "Invalid choice"; continue;;
            esac
            read -p "Enter $input_type URL/path: " input_url
            if [ "$input_type" = "udp" ]; then if scan_udp_programs; then select_program; fi; fi
            ;;
        2) # Configure Output
            echo -e "\\nOutput Format: 1)UDP 2)HLS 3)DASH 4)RTMP 5)File 6)Multi-Output"
            read -p "Select output format [1-6]: " choice
            case $choice in
                1) output_format="udp";; 2) output_format="hls";; 3) output_format="dash";;
                4) output_format="rtmp";; 5) output_format="file";; 6) output_format="multi";;
                *) echo "Invalid choice"; continue;;
            esac
            if [ "$output_format" = "multi" ]; then
                echo "Enter URLs for each desired output (leave blank to disable):"
                read -p "HLS URL: " hls_url; read -p "DASH URL: " dash_url
                read -p "RTMP URL: " rtmp_url; read -p "UDP URL: " udp_url
                read -p "File URL: " file_url
            else
                read -p "Enter $output_format URL/path: " output_url
            fi
            ;;
        3) # Configure Encoding
            echo -e "\\nSelect Video Encoder:"
            echo "1. CPU (libx264) - High quality, high CPU usage"
            echo "2. NVIDIA GPU (h264_nvenc) - Very fast, low CPU usage"
            echo "3. Intel GPU (h264_qsv) - Very fast, low CPU usage"
            read -p "Select encoder [1-3]: " choice
            case $choice in
                1) video_codec="libx264";; 2) video_codec="h264_nvenc";; 3) video_codec="h264_qsv";;
                *) echo "Invalid choice"; continue;;
            esac
            read -p "Enter encoding preset (e.g., veryfast, superfast, ultrafast) [\$encoding_preset]: " new_preset
            encoding_preset=\${new_preset:-$encoding_preset}
            if [ "$video_codec" = "libx264" ]; then
                read -p "Enter CRF value (18-28) [\$crf]: " new_crf
                crf=\${new_crf:-$crf}
            fi
            ;;
        4) # Configure Stream Selection
            if [ -z "$input_url" ]; then echo "Error: Input URL not configured."; continue; fi
            if scan_streams; then select_streams; fi
            ;;
        5) # Configure Logo Overlay
            configure_logo
            ;;
        6) # Show Current Configuration
             # (This menu option would be here, logic is straightforward and omitted for brevity)
            echo "Use the other menu options to see current settings."
            ;;
        7) # Save Configuration
            save_config
            ;;
        8) # Start Transcoding
            if ! validate_config; then continue; fi
            build_ffmpeg_command
            echo -e "\\n--- Generated FFmpeg Command ---"
            printf "%q " "\${ffmpeg_cmd_array[@]}"; echo -e "\\n"
            read -p "Start transcoding? (y/n) " -n 1 -r; echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then continue; fi
            read -p "Enable auto-restart? (y/n) " -n 1 -r; echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo "Starting with auto-restart... (Press Ctrl+C to stop)"
                while true; do
                    "\${ffmpeg_cmd_array[@]}"
                    echo "FFmpeg exited. Restarting in 5 seconds..."
                    sleep 5
                done
            else
                echo "Starting... (Press Ctrl+C to stop)"
                "\${ffmpeg_cmd_array[@]}"
            fi
            ;;
        9) # Exit
            exit 0
            ;;
        *)
            echo "Invalid option."
            ;;
    esac
done
`;

const App: React.FC = () => {
  const [scriptContent, setScriptContent] = useState<string>(initialScript);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!scriptContent) {
      setError("Script content cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeScript(scriptContent);
      setAnalysis(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Analysis failed: ${err.message}`);
      } else {
        setError("An unknown error occurred during analysis.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [scriptContent]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <CodeInput
            scriptContent={scriptContent}
            setScriptContent={setScriptContent}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
          <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 h-full min-h-[500px]">
            {isLoading && <Spinner />}
            {error && <ErrorMessage message={error} />}
            {analysis && !isLoading && <AnalysisResult analysis={analysis} />}
            {!isLoading && !error && !analysis && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                <h2 className="text-xl font-bold">Analysis Results</h2>
                <p className="mt-2 text-center">Your script analysis will appear here once you click the "Analyze Script" button.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
