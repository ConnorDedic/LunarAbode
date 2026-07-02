const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const GUIDES_DIR = path.join(__dirname, 'guides');

// Ensure guides directory exists
if (!fs.existsSync(GUIDES_DIR)) {
	fs.mkdirSync(GUIDES_DIR, { recursive: true });
}

// Get list of all guides
app.get('/api/guides', (req, res) => {
	try {
		const files = fs.readdirSync(GUIDES_DIR)
			.filter(file => file.endsWith('.md'))
			.sort();

		const guides = files.map((file, index) => ({
			id: index + 1,
			title: file.replace('.md', '').replace(/-/g, ' '),
			filename: file,
			date: '2026-06-20'
		}));

		res.json(guides);
	} catch (error) {
		console.error('Error reading guides:', error);
		res.status(500).json({ error: 'Failed to read guides' });
	}
});

// Get specific guide content
app.get('/api/guides/:id', (req, res) => {
	try {
		const guides = fs.readdirSync(GUIDES_DIR)
			.filter(file => file.endsWith('.md'))
			.sort();

		const guideFile = guides[parseInt(req.params.id) - 1];
		if (!guideFile) {
			return res.status(404).json({ error: 'Guide not found' });
		}

		const content = fs.readFileSync(path.join(GUIDES_DIR, guideFile), 'utf-8');
		res.json({ content });
	} catch (error) {
		console.error('Error reading guide:', error);
		res.status(500).json({ error: 'Failed to read guide' });
	}
});

const PORT = 3001;
app.listen(PORT, () => {
	console.log(`Guides server running on port ${PORT}`);
});
