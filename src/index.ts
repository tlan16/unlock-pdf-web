import "./index.css";
import createModule, { type QpdfInstance } from "@neslinesli93/qpdf-wasm";

const rootEl = document.querySelector("#root");
let qpdfInstance: QpdfInstance | null = null;
let fileList: FileList | null = null;
let convertedFiles:
	| {
			originalFile: File;
			convertedFile: null | Awaited<ReturnType<typeof convertFile>>;
			error?: unknown | undefined;
	  }[]
	| null = null;

if (rootEl) {
	rootEl.innerHTML = `
  <div class="w-screen h-screen flex flex-col items-center justify-center bg-gray-100 px-10">
    <h1>Unlock PDF</h1>
    <p>Unlock PDF without uploading to server</p>
   <section id="loading-indicator" class="underline">Loading...</section>
   <section id="file-uploader" class="mt-4 hidden">
    <input type="file" id="file_input" accept="application/pdf" multiple class="border-2 p-3 hidden" />
    <label for="file_input" class="bg-blue-500 text-white p-2 rounded cursor-pointer">Select PDF Files</label>
    </section>
    <section id="file-list" class="mt-4 hidden">
    </section>
    <section id="footer" class="mt-4 hidden">
      <button id="download-all-button" class="bg-blue-500 text-white p-2 rounded hidden">Download All</button>
      <button id="restart-button" class="bg-gray-300 p-2 rounded" onclick="location.reload()">Restart</button>
    </section>
  </div>
`;

	document.addEventListener("DOMContentLoaded", async () => {
		try {
			await loadQpdfWasm();
		} catch (error) {
			console.error("Error loading QPDF WASM:", error);
			getLoadingIndicatorElement()?.classList.remove("underline");
			getLoadingIndicatorElement()?.setHTMLUnsafe(`
        <p class="text-red-500 text-xl font-extrabold">Error loading QPDF WASM</p>
      `);
			getFileListElement()?.setHTMLUnsafe("Error loading QPDF WASM");
			return;
		}
		getLoadingIndicatorElement()?.classList.add("hidden");
		document.querySelector(`section#file-uploader`)?.classList.remove("hidden");
		getFileUploaderInput()?.addEventListener("change", (event) =>
			onFileSelected(event as InputEvent),
		);
		getDownloadAllButtonElement()?.addEventListener("click", downloadAll);
	});
}

function getLoadingIndicatorElement() {
	return document.querySelector(`section#loading-indicator`);
}

async function downloadAll() {
	if (!convertedFiles) {
		getDownloadAllButtonElement()?.setHTMLUnsafe(
			"No converted files to download",
		);
		return;
	}
	getDownloadAllButtonElement()?.setHTMLUnsafe("Preparing download...");
	const { default: JSZip } = await import("jszip");

	const zip = new JSZip();
	const zipName = "unlocked_files.zip";
	convertedFiles.forEach((file) => {
		if (file.convertedFile) {
			const fileName = generate_unlocked_file_name(file.originalFile.name);
			zip.file(fileName, file.convertedFile);
		}
	});
	const zipFileBlob = await zip.generateAsync({ type: "blob" });
	const blob = new Blob([zipFileBlob], { type: "application/zip" });
	const url = URL.createObjectURL(blob);
	const fakeLink = document.createElement("a");
	fakeLink.href = url;
	fakeLink.download = zipName;
	fakeLink.click();
	URL.revokeObjectURL(url);
	getDownloadAllButtonElement()?.setHTMLUnsafe("Download All");
}

function generate_unlocked_file_name(originalFileName: string) {
	let fileName = originalFileName.replace(/[^a-zA-Z0-9]/g, "_");
	const suffix = "_unlocked.pdf";
	if (!fileName.endsWith(suffix)) fileName += suffix;
	fileName = truncateFromStart(fileName);
	return fileName;
}

function truncateFromStart(value: string, maxLength = 100) {
	return value.length > maxLength ? value.slice(-maxLength) : value;
}

async function convertFile(file: File) {
	const fileBuffer = await file.arrayBuffer();
	const uint8Array = new Uint8Array(fileBuffer);
	const inputPath = "/input_file.pdf";
	const qpdf = await loadQpdfWasm();
	// @ts-ignore
	qpdf.FS.writeFile(inputPath, uint8Array);

	qpdf.callMain(["/input_file.pdf", "--decrypt", "--", "/output_file.pdf"]);

	// read the output file and create a new objectUrl for example
	return qpdf.FS.readFile("/output_file.pdf");
}

function getFileUploaderElement() {
	return document.querySelector(`section#file-uploader`);
}

function getFileUploaderInput() {
	return getFileUploaderElement()?.querySelector(
		`section#file-uploader input[type="file"]`,
	);
}

function getFileListElement() {
	return document.querySelector(`section#file-list`);
}

function getFooterElement() {
	return document.querySelector(`section#footer`);
}

function getDownloadAllButtonElement() {
	return getFooterElement()?.querySelector(`button#download-all-button`);
}

async function onFileSelected(event: InputEvent) {
	const { default: byteSize } = await import("byte-size");
	fileList = (event.target as HTMLInputElement).files;
	if (!fileList?.length) return;
	getFileListElement()?.classList.remove("hidden");
	getFileUploaderElement()?.classList.add("hidden");
	let resultHtml = `<div class="grid gap-4 [grid-template-columns:3fr_1fr_1fr]">`;
	convertedFiles = [];
	for (const index in Array.from(fileList)) {
		const file = fileList[index];
		getFileListElement()?.setHTMLUnsafe(
			`Converting ${toOrdinal(Number.parseInt(index) + 1)} files...`,
		);
		const fileName = file.name;
		const fileSize = byteSize(file.size);
		resultHtml += `<p class="text-lg font-bold underline">${fileName}</p>`;
		resultHtml += `<p class="text-lg">Size: ${fileSize.value} ${fileSize.unit}</p>`;
		try {
			const convertedFile = await convertFile(file);
			const convertedFileUrl = URL.createObjectURL(new Blob([convertedFile]));
			convertedFiles.push({
				originalFile: file,
				convertedFile: convertedFile,
			});
			resultHtml += `<a href="${convertedFileUrl}" download="${generate_unlocked_file_name(fileName)}" class="text-blue-500 underline">Download Unlocked</a>`;
		} catch (error) {
			convertedFiles.push({
				originalFile: file,
				convertedFile: null,
				error: error,
			});
			console.error("Error converting file:", { file, error });
			resultHtml += `<p class="text-red-500">Error converting file</p>`;
		}
	}
	resultHtml += `</div>`;
	if (
		convertedFiles.filter(({ convertedFile }) => Boolean(convertedFile))
			.length > 1
	) {
		getDownloadAllButtonElement()?.classList.remove("hidden");
	}
	getFooterElement()?.classList.remove("hidden");
	getFileListElement()?.setHTMLUnsafe(resultHtml);
}

async function loadQpdfWasm(): Promise<QpdfInstance> {
	if (qpdfInstance) {
		return qpdfInstance;
	}

	const wasmUrl = "./qpdf.wasm";
	qpdfInstance = await createModule({
		locateFile: () => wasmUrl,
		// @ts-ignore
		noInitialRun: true,
	});
	return qpdfInstance;
}

function toOrdinal(n: number) {
	try {
		const pr = new Intl.PluralRules("en-US", { type: "ordinal" });
		const suffixes = { one: "st", two: "nd", few: "rd", other: "th" } as const;
		const category = pr.select(n) as keyof typeof suffixes;
		return `${n}${suffixes[category]}`;
	} catch (error) {
		console.error("Error getting ordinal:", error);
		return `${n}th`;
	}
}
