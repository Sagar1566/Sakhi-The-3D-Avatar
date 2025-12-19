# How to Increase Virtual Memory on Windows

## Steps:

1. **Open System Properties**
   - Press `Win + Pause/Break` or right-click "This PC" → Properties
   - Click "Advanced system settings" on the left

2. **Access Virtual Memory Settings**
   - Under "Performance" section, click "Settings"
   - Go to "Advanced" tab
   - Click "Change..." under Virtual Memory

3. **Configure Paging File**
   - Uncheck "Automatically manage paging file size for all drives"
   - Select your system drive (usually C:)
   - Choose "Custom size"
   - Set **Initial size**: `16384` MB (16 GB)
   - Set **Maximum size**: `32768` MB (32 GB)
   - Click "Set" then "OK"

4. **Restart Your Computer**
   - Changes take effect after restart

## Recommended Sizes:
- **Minimum**: 16 GB (for PyTorch + Whisper)
- **Recommended**: 24-32 GB (for smooth operation)

## After Restart:
Run the server again with:
```bash
pnpm dev:server
```
