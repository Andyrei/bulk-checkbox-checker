# Bulk Checkbox Checker

A powerful Chrome extension that allows you to easily manage checkboxes on any webpage with just one click. Perfect for forms, surveys, and websites with multiple checkboxes.

![Extension Popup](docs/assets/bulk-checkbox-checker-ui.png)

## Features

- **One-Click Operations**: Check, uncheck, or toggle all checkboxes instantly
- **Smart Visibility Detection**: Option to target only visible checkboxes
- **Inspect Mode**: Select a specific container to limit checkbox operations
- **Real-Time Counter**: Live display of total, visible, and checked checkboxes
- **Keyboard Shortcuts**: Quick access without opening the popup
- **Visual Feedback**: Hover effects and success notifications
- **Universal Compatibility**: Works on all websites
- **Lightweight**: Minimal resource usage

## Installation

### From Chrome Web Store
*Coming soon*

### Manual Installation (Developer Mode)

1. Download or clone this repository:
   ```bash
   git clone https://github.com/Andyrei/bulk-checkbox-checker.git
   cd bulk-checkbox-checker
   ```

2. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (top right corner)
   - Click **Load unpacked**
   - Select the extension folder
   - The Bulk Checkbox Checker icon will appear in your toolbar

## How to Use

### Using the Popup Interface

1. Navigate to any webpage with checkboxes
2. Click the **Bulk Checkbox Checker** extension icon in your toolbar
3. View the real-time checkbox statistics
4. Choose your action:
   - **Check All** - Checks all unchecked boxes
   - **Uncheck All** - Unchecks all checked boxes
   - **Toggle** - Flips the state of all boxes
   - **Click Visible** - Only affects visible checkboxes

### Using Inspect Mode

Need to target checkboxes in a specific section? Use Inspect Mode:

1. Click **Inspect** in the popup
2. Hover over any element on the page - it will be highlighted
3. Click to select the container
4. Now all operations only affect checkboxes within that container
5. Click **Exit Inspect** or press `Esc` to exit

### Using Keyboard Shortcuts

- `Ctrl + Shift + C` - Check all checkboxes
- `Ctrl + Shift + U` - Uncheck all checkboxes
- `Ctrl + Shift + T` - Toggle all checkboxes

## Demo Videos

### Basic Usage Demo
Check all, uncheck all, or toggle all checkboxes on any page.

https://github.com/user-attachments/assets/65cab9f3-9fd0-4abf-953d-d9883de4678a

### Inspect Feature Demo
Select a specific container to target only checkboxes within that section.

https://github.com/user-attachments/assets/03dc7a06-2b98-4a5f-bb65-de2b080c540b



## Usage Examples

- **E-commerce**: Select multiple products for comparison or checkout
- **Forms & Surveys**: Select all applicable options quickly
- **Task Management**: Mark multiple tasks as complete
- **Social Media**: Bulk select posts or messages in specific sections
- **Nasty cookie policy forms**: Boxes that you wan to uncheck/check

## File Structure

```
bulk-checkbox-checker/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── content.js            # Content script for web interaction
├── background.js         # Background service worker
├── cc-styles.css         # Popup styles
├── docs/
│   └── assets/           # Screenshots and demo videos
└── README.md             # This file
```

## Permissions

- `activeTab` - Access to the current active tab
- `scripting` - Ability to inject scripts into web pages

## Browser Compatibility

- Chrome 88+
- Chromium-based browsers (Edge, Brave, etc.)

## Privacy

- **No Data Collection** - Extension doesn't collect or store any personal data
- **Local Processing** - All operations happen locally in your browser
- **No External Requests** - No communication with external servers

## Tech Stack

- **Manifest V3** - Latest Chrome extension standard
- **Vanilla JavaScript** - No external dependencies

## Troubleshooting

### Extension Not Working?
- Refresh the page after installing
- Check permissions for the current site
- Go to `chrome://extensions/` and reload

### No Checkboxes Detected?
- The page might use custom checkbox elements
- Try refreshing the page
- Use Inspect Mode to select the correct container

## Contributing

Contributions are welcome! Please submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **GitHub Issues**: Report bugs or request features
- **Email**: Contact information

---

### If you find this extension helpful, please give it a star! 
