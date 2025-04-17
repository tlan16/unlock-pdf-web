import './index.css';
import createModule from "@neslinesli93/qpdf-wasm";

const rootEl = document.querySelector('#root');
if (rootEl) {
  rootEl.innerHTML = `
  <div class="w-screen h-screen flex flex-col items-center justify-center bg-gray-100">
    <h1 class="text-3xl font-bold underline">Unlock PDF</h1>
    <p>Unlock PDF without uploading to server</p>
    <div class="w-md min-h-[10rem] border border-black flex flex-col justify-center" id="drop_zone">
        <p class="flex justify-center">Drag one or more files to this <i>drop zone</i>.</p>
      </div>
  </div>
`;

  // Attach event handlers after creating the DOM elements
  const dropZone = document.getElementById('drop_zone');
  if (dropZone) {
    dropZone.addEventListener('dragover', dragOverHandler);
    dropZone.addEventListener('drop', dropHandler);
  }
}

function dragOverHandler(event: DragEvent) {
  event.preventDefault();
  const dropZone = document.getElementById('drop_zone');
  if (dropZone) {
    dropZone.classList.add('bg-gray-200');
  }
}

async function dropHandler(event: DragEvent) {
  event.preventDefault();
  const dt = event.dataTransfer;
  if (dt && dt.items) {
    const files = dt.items;
    for (let i = 0; i < files.length; i++) {
      if (files[i].kind === 'file') {
        const file = files[i].getAsFile();
        if (file) {
          const wasmUrl = "/qpdf.wasm";
          const qpdf = await createModule({
            locateFile: () => wasmUrl,
            noInitialRun: true,
            preRun: [
              (module: any) => {
                // Ensure FS is available
                if (module.FS) {
                  try {
                    module.FS.mkdir(INPUT_FOLDER);
                    module.FS.mkdir(OUTPUT_FOLDER);
                  } catch (e) {
                    console.warn("Error creating directories:", e);
                  }
                }
              },
            ],
          });
          console.log({
            file,
            qpdf,
          });
          const fileBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(fileBuffer);
          const inputPath = "/input_file.pdf";
          qpdf.FS.writeFile(inputPath, uint8Array);

          // invoke qpdf
          qpdf.callMain(["/input_file.pdf", "--decrypt", "--", "/output_file.pdf"]);

          // read the output file and create a new objectUrl for example
          const outputFile = qpdf.FS.readFile("/output_file.pdf");
          const outputFileUrl = URL.createObjectURL(new Blob([outputFile]));
          console.log({outputFileUrl})
          const downloadLink = document.createElement('a');
          downloadLink.href = outputFileUrl;
          downloadLink.download = "output_file.pdf";
          downloadLink.textContent = "Download Decrypted PDF";
          downloadLink.className = "text-blue-500 underline";
          const dropZone = document.getElementById('drop_zone');
          if (dropZone) {
            dropZone.innerHTML = '';
            dropZone.appendChild(downloadLink);
          }
        }
      }
    }
  }
}