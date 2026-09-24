================================================================================
SHORELINE PRIVATE PARKING - VIDEO ASSET GUIDE
================================================================================

Target File:
  assets/videos/park-tour.mp4

Poster Image:
  assets/videos/park-tour-poster.jpg

Recommended Video Specifications:
  - Container / Format: MP4 (H.264 video codec, AAC audio codec)
  - Resolution:         1920x1080 (1080p) or 1280x720 (720p)
  - Aspect Ratio:       16:9 Widescreen
  - Frame Rate:         24fps or 30fps
  - Target Bitrate:     1.5 Mbps - 2.5 Mbps
  - File Size:          Under 25 MB for fast web loading
  - Web Optimization:   Run through HandBrake or ffmpeg with "+faststart" flag so
                        playback begins before the full file finishes downloading.

FFmpeg Optimization Command:
  ffmpeg -i raw-footage.mov -vcodec libx264 -crf 24 -preset slow -pix_fmt yuv420p \
         -movflags +faststart -an assets/videos/park-tour.mp4
