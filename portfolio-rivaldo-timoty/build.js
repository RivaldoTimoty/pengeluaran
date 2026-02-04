const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting build process...\n');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('📁 Created dist directory');
}

// Function to copy files recursively
function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(
                path.join(src, childItemName),
                path.join(dest, childItemName)
            );
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// Function to minify HTML
function minifyHTML(content) {
    return content
        .replace(/\s+/g, ' ')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .trim();
}

// Function to optimize images (placeholder - in real project use sharp or imagemin)
function optimizeImages(srcDir, destDir) {
    console.log('🖼️  Skipping image optimization (install sharp/imagemin for production)');
    // Copy images as-is
    copyRecursiveSync(srcDir, destDir);
}

// Main build function
async function build() {
    try {
        console.log('📄 Processing HTML file...');

        // Read HTML file
        const htmlPath = path.join(__dirname, 'index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');

        // For production, replace CDN with local if needed
        // html = html.replace('CDN_URL', 'local/path');

        // Minify HTML
        const minifiedHTML = minifyHTML(html);

        // Write to dist
        fs.writeFileSync(path.join(distDir, 'index.html'), minifiedHTML);
        console.log('✅ HTML file minified and saved to dist/index.html');

        // Copy assets
        console.log('📁 Copying assets...');
        copyRecursiveSync(path.join(__dirname, 'assets'), path.join(distDir, 'assets'));
        console.log('✅ Assets copied to dist/assets');

        // Create a simple README for dist
        const readmeContent = `# Portfolio Build

This is the built version of Rivaldo Timoty's portfolio website.

## Deployment

You can deploy this folder to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

## Original Source

The source code is available in the parent directory.

Built on: ${new Date().toISOString()}
`;

        fs.writeFileSync(path.join(distDir, 'README.md'), readmeContent);

        // Create a simple version file
        const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
        const versionInfo = {
            version: packageJson.version,
            buildDate: new Date().toISOString(),
            buildType: 'production'
        };

        fs.writeFileSync(
            path.join(distDir, 'version.json'),
            JSON.stringify(versionInfo, null, 2)
        );

        console.log('\n🎉 Build completed successfully!');
        console.log('📊 Build info:');
        console.log(`   Version: ${versionInfo.version}`);
        console.log(`   Build date: ${new Date().toLocaleString()}`);
        console.log(`   Output: ${distDir}`);
        console.log('\n📦 To run the built version:');
        console.log('   npm run serve');
        console.log('\n🌐 To deploy:');
        console.log('   Upload the "dist" folder to your hosting service');

    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

// Run build
build();