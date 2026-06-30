

const os = require('os');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');

// Detect Operating System
const platform = os.platform();
console.log(`Initializing Saint CMS engine for ${platform}...`);

let binaryName = '';
if (platform === 'win32') binaryName = 'saint-windows.exe';
else if (platform === 'darwin') binaryName = 'saint-macos';
else if (platform === 'linux') binaryName = 'saint-linux';
else {
  console.error(' Unsupported operating system.');
  process.exit(1);
}


const targetDir = path.join(process.cwd(), 'saint-cms-app');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}
const binaryPath = path.join(targetDir, binaryName);


const GITHUB_USERNAME = 'Agbara286'; 
const REPO_NAME = 'saint-cms';
const VERSION = 'v1.0.0'; 
const downloadUrl = `https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/releases/download/${VERSION}/${binaryName}`;

async function bootEngine() {
   

const sourceOutDir = path.join(__dirname, '..', 'out');
const targetOutDir = path.join(targetDir, 'out');

if (!fs.existsSync(targetOutDir)) {
  console.log(' Unpacking Saint CMS dashboard...');

  fs.cpSync(sourceOutDir, targetOutDir, { recursive: true });
}
 


  if (fs.existsSync(binaryPath)) {
    console.log('Starting Saint CMS server...');
    runBinary();

    return;
  }

  
  try {
    console.log(`Downloading Go engine from GitHub Releases...`);
    const writer = fs.createWriteStream(binaryPath);
    
    const response = await axios({
      url: downloadUrl,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(writer);

    writer.on('finish', () => {
      console.log('Download complete!');
      if (platform !== 'win32') fs.chmodSync(binaryPath, '755'); // Grant permissions for Unix
      console.log('Starting Saint CMS server...');
      runBinary();
    });

    writer.on('error', (err) => {
      console.error('File write error:', err);
    });

  } catch (error) {
    console.error('Failed to download Saint CMS engine. Make sure the GitHub Release is public.');
    console.error(error.message);
  }
}

function runBinary() {
  
  const child = spawn(binaryPath, [], { stdio: 'inherit', shell: true });

  child.on('close', (code) => {
    console.log(`Saint CMS process exited with code ${code}`);
    process.exit(code);
  });
}

bootEngine();