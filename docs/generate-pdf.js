const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const markdownIt = require('markdown-it');
const https = require('https');
const http = require('http');

// Initialize markdown-it with options
const md = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
});

// Document order and configuration
const documents = [
    { file: '01-README.md', title: 'MyTravel - Overview' },
    { file: '02-SETUP.md', title: 'Setup Guide' },
    { file: '03-FEATURES.md', title: 'Features' },
    { file: '04-ARCHITECTURE.md', title: 'Architecture' },
    { file: '05-TECHNOLOGIES.md', title: 'Technologies' },
    { file: '06-API.md', title: 'API Reference' },
    { file: '07-ERROR-HANDLING.md', title: 'Error Handling' }
];

// Convert image to base64 data URI
function imageToBase64(imagePath) {
    try {
        const absolutePath = path.resolve(__dirname, imagePath);
        if (fs.existsSync(absolutePath)) {
            const imageBuffer = fs.readFileSync(absolutePath);
            const base64 = imageBuffer.toString('base64');
            const ext = path.extname(imagePath).toLowerCase();
            const mimeType = ext === '.png' ? 'image/png' : 
                           ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                           ext === '.gif' ? 'image/gif' : 'image/png';
            return `data:${mimeType};base64,${base64}`;
        }
    } catch (err) {
        console.warn(`Warning: Could not load image ${imagePath}: ${err.message}`);
    }
    return null;
}

// Fetch image from URL and convert to base64
function fetchImageAsBase64(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        const request = protocol.get(url, { timeout: 30000 }, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Follow redirect
                fetchImageAsBase64(response.headers.location).then(resolve).catch(reject);
                return;
            }
            
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }
            
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const base64 = buffer.toString('base64');
                const contentType = response.headers['content-type'] || 'image/png';
                resolve(`data:${contentType};base64,${base64}`);
            });
            response.on('error', reject);
        });
        
        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Convert Mermaid code to image URL using mermaid.ink
function getMermaidImageUrl(mermaidCode) {
    // Base64 encode the mermaid code for the URL
    const encoded = Buffer.from(mermaidCode.trim()).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    
    return `https://mermaid.ink/img/${encoded}?theme=default&bgColor=white`;
}

// Process mermaid code blocks and convert to images
async function processMermaidDiagrams(content) {
    const mermaidRegex = /```mermaid\s*([\s\S]*?)```/g;
    let match;
    let diagramCount = 0;
    const replacements = [];
    
    while ((match = mermaidRegex.exec(content)) !== null) {
        diagramCount++;
        const mermaidCode = match[1].trim();
        const fullMatch = match[0];
        const startIndex = match.index;
        
        console.log(`  Converting Mermaid diagram ${diagramCount}...`);
        
        try {
            const imageUrl = getMermaidImageUrl(mermaidCode);
            const base64Image = await fetchImageAsBase64(imageUrl);
            
            // Create an image tag to replace the mermaid code block
            const imageHtml = `\n\n![Diagram ${diagramCount}](${base64Image})\n\n`;
            replacements.push({ fullMatch, imageHtml, startIndex });
            console.log(`    ✓ Diagram ${diagramCount} converted successfully`);
        } catch (err) {
            console.warn(`    ✗ Failed to convert diagram ${diagramCount}: ${err.message}`);
            // Keep a placeholder for failed diagrams
            const placeholder = `\n\n*[Diagram ${diagramCount} - rendering failed]*\n\n`;
            replacements.push({ fullMatch, imageHtml: placeholder, startIndex });
        }
    }
    
    // Replace from end to start to preserve indices
    replacements.reverse();
    for (const { fullMatch, imageHtml } of replacements) {
        content = content.replace(fullMatch, imageHtml);
    }
    
    return content;
}

// Process markdown content - convert images to base64 BEFORE markdown conversion
async function processMarkdown(content, docIndex) {
    // Remove the back link at the bottom of each document
    content = content.replace(/---\s*\n\s*\[← Back to Documentation\].*$/gm, '');
    
    // Process Mermaid diagrams first (convert to images)
    content = await processMermaidDiagrams(content);
    
    // Convert image markdown syntax to base64 data URIs BEFORE markdown processing
    content = content.replace(/!\[([^\]]*)\]\(\.\/screenshots\/([^)]+)\)/g, (match, alt, imgFile) => {
        const imgPath = `screenshots/${imgFile}`;
        const base64Uri = imageToBase64(imgPath);
        if (base64Uri) {
            console.log(`    Embedded image: ${imgFile}`);
            return `![${alt}](${base64Uri})`;
        }
        console.warn(`    Warning: Image not found: ${imgFile}`);
        return `![${alt}](missing)`;
    });
    
    // Also handle homepage.png in root
    content = content.replace(/!\[([^\]]*)\]\(\.\/([^)]+\.png)\)/g, (match, alt, imgFile) => {
        if (!imgFile.startsWith('screenshots/')) {
            const base64Uri = imageToBase64(imgFile);
            if (base64Uri) {
                console.log(`    Embedded image: ${imgFile}`);
                return `![${alt}](${base64Uri})`;
            }
        }
        return match;
    });
    
    // Convert markdown to HTML
    let html = md.render(content);
    
    return html;
}

// Generate the full HTML document
async function generateHTML() {
    let sectionsHtml = '';
    
    for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const filePath = path.join(__dirname, doc.file);
        
        console.log(`Processing: ${doc.file}`);
        
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            // Remove markdown fence markers if present
            content = content.replace(/^```+markdown\s*/i, '').replace(/\s*```+$/i, '');
            content = content.replace(/^````+markdown\s*/i, '').replace(/\s*````+$/i, '');
            
            const html = await processMarkdown(content, i);
            
            // Add page break class for all sections except the first
            const pageBreakClass = i > 0 ? 'page-break-before' : '';
            
            sectionsHtml += `
                <section class="document-section ${pageBreakClass}" id="section-${i}">
                    ${html}
                </section>
            `;
        } catch (err) {
            console.error(`Error processing ${doc.file}:`, err.message);
        }
    }
    
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyTravel Documentation</title>
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            font-size: 11pt;
            background: white;
        }
        
        /* Page break styles */
        .page-break-before {
            page-break-before: always;
        }
        
        .page-break-after {
            page-break-after: always;
        }
        
        /* Avoid breaks inside elements */
        h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
        }
        
        img, table, pre, blockquote {
            page-break-inside: avoid;
        }
        
        /* Document section */
        .document-section {
            padding: 0 20px;
        }
        
        /* Headings */
        h1 {
            font-size: 24pt;
            color: #1a365d;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #3182ce;
        }
        
        h2 {
            font-size: 18pt;
            color: #2c5282;
            margin-top: 30px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #90cdf4;
        }
        
        h3 {
            font-size: 14pt;
            color: #2d3748;
            margin-top: 25px;
            margin-bottom: 12px;
        }
        
        h4 {
            font-size: 12pt;
            color: #4a5568;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        
        /* Paragraphs */
        p {
            margin-bottom: 12px;
            text-align: justify;
        }
        
        /* Emphasis and strong text */
        em {
            font-style: italic;
            color: #4a5568;
        }
        
        strong {
            font-weight: 600;
            color: #1a202c;
        }
        
        /* Links */
        a {
            color: #3182ce;
            text-decoration: none;
        }
        
        /* Images */
        img {
            max-width: 100%;
            height: auto;
            margin: 15px auto;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            display: block;
        }
        
        /* Diagram images - special styling */
        img[alt^="Diagram"] {
            max-width: 90%;
            margin: 20px auto;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 10px;
            background-color: #f8fafc;
        }
        
        /* Hide missing images */
        img[src="missing"] {
            display: none;
        }
        
        /* Screenshot tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            page-break-inside: avoid;
        }
        
        th, td {
            border: 1px solid #e2e8f0;
            padding: 12px;
            text-align: left;
            vertical-align: top;
        }
        
        th {
            background-color: #edf2f7;
            font-weight: 600;
            color: #2d3748;
            text-align: center;
        }
        
        tr:nth-child(even) {
            background-color: #f7fafc;
        }
        
        /* Center images in tables */
        td img {
            display: block;
            margin: 0 auto;
            max-width: 280px;
            max-height: 200px;
            object-fit: contain;
        }
        
        td em {
            display: block;
            text-align: center;
            font-size: 9pt;
            color: #718096;
            margin-top: 8px;
        }
        
        td {
            text-align: center;
            vertical-align: middle;
        }
        
        /* Code blocks */
        pre {
            background-color: #1a202c;
            color: #e2e8f0;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 15px 0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 9pt;
            line-height: 1.5;
        }
        
        code {
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 9pt;
        }
        
        p code, li code, td code {
            background-color: #edf2f7;
            color: #c53030;
            padding: 2px 6px;
            border-radius: 4px;
        }
        
        /* Lists */
        ul, ol {
            margin: 12px 0;
            padding-left: 30px;
        }
        
        li {
            margin-bottom: 6px;
        }
        
        /* Blockquotes */
        blockquote {
            border-left: 4px solid #3182ce;
            padding: 12px 20px;
            margin: 15px 0;
            background-color: #ebf8ff;
            font-style: italic;
            color: #2c5282;
        }
        
        /* Horizontal rules */
        hr {
            border: none;
            border-top: 2px solid #e2e8f0;
            margin: 30px 0;
        }
        
        /* Cover page styles */
        .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            page-break-after: always;
        }
        
        .cover-page h1 {
            font-size: 48pt;
            border: none;
            color: white;
            margin-bottom: 20px;
        }
        
        .cover-page .subtitle {
            font-size: 18pt;
            opacity: 0.9;
            margin-bottom: 40px;
        }
        
        .cover-page .version {
            font-size: 12pt;
            opacity: 0.8;
        }
        
        /* Table of contents */
        .toc {
            padding: 40px;
            page-break-after: always;
        }
        
        .toc h2 {
            font-size: 24pt;
            text-align: center;
            margin-bottom: 40px;
        }
        
        .toc-list {
            list-style: none;
            padding: 0;
        }
        
        .toc-list li {
            padding: 12px 0;
            border-bottom: 1px dotted #cbd5e0;
            display: flex;
            justify-content: space-between;
        }
        
        .toc-list li:last-child {
            border-bottom: none;
        }
        
        .toc-list a {
            color: #2d3748;
            font-size: 12pt;
        }
        
        .toc-list .page-num {
            color: #718096;
        }
        
        /* Footer */
        @page {
            margin: 1in;
            @bottom-center {
                content: counter(page);
            }
        }
        
        /* Print optimizations */
        @media print {
            body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            
            .cover-page {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            }
            
            pre {
                background-color: #1a202c !important;
                color: #e2e8f0 !important;
            }
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="cover-page">
        <h1>MyTravel</h1>
        <div class="subtitle">Travel Booking Platform Documentation</div>
        <div class="version">
            <p>Full-Stack Application Documentation</p>
            <p>Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
    </div>
    
    <!-- Table of Contents -->
    <div class="toc">
        <h2>Table of Contents</h2>
        <ol class="toc-list">
            ${documents.map((doc, i) => `<li><a href="#section-${i}">${doc.title}</a></li>`).join('\n            ')}
        </ol>
    </div>
    
    <!-- Document Sections -->
    ${sectionsHtml}
</body>
</html>
    `;
    
    return fullHtml;
}

// Generate PDF
async function generatePDF() {
    console.log('=' .repeat(60));
    console.log('MyTravel Documentation PDF Generator');
    console.log('=' .repeat(60));
    console.log('');
    console.log('Generating HTML content...');
    console.log('');
    
    const html = await generateHTML();
    
    // Save HTML to file
    const htmlPath = path.join(__dirname, 'MyTravel-Documentation.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`\nHTML saved to: ${htmlPath}`);
    
    console.log('\nLaunching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--allow-file-access-from-files']
    });
    
    const page = await browser.newPage();
    
    // Set viewport for better rendering
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navigate to the HTML file directly instead of using setContent
    console.log('Loading HTML file...');
    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
    await page.goto(fileUrl, { 
        waitUntil: 'networkidle2',
        timeout: 180000
    });
    
    // Wait for images to load
    await page.evaluate(async () => {
        const images = document.querySelectorAll('img');
        await Promise.all(Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        }));
    });
    
    // Additional wait for rendering
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Generating PDF...');
    const pdfPath = path.join(__dirname, 'MyTravel-Documentation.pdf');
    
    // Delete old PDF if exists
    if (fs.existsSync(pdfPath)) {
        try {
            fs.unlinkSync(pdfPath);
        } catch (e) {
            // Use alternate name if file is locked
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            pdfPath = path.join(__dirname, `MyTravel-Documentation-${timestamp}.pdf`);
        }
    }
    
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
            <div style="font-size: 9pt; width: 100%; text-align: center; color: #666; padding: 10px;">
                <span>MyTravel Documentation</span>
                <span style="margin-left: 20px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
            </div>
        `,
        margin: {
            top: '0.75in',
            bottom: '0.75in',
            left: '0.75in',
            right: '0.75in'
        },
        preferCSSPageSize: false
    });
    
    await browser.close();
    
    // Get file size
    const stats = fs.statSync(pdfPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('');
    console.log('=' .repeat(60));
    console.log('PDF generated successfully!');
    console.log(`Location: ${pdfPath}`);
    console.log(`File size: ${fileSizeMB} MB`);
    console.log('=' .repeat(60));
}

// Run the generator
generatePDF().catch(err => {
    console.error('Error generating PDF:', err);
    process.exit(1);
});

