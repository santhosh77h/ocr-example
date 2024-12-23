import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';
import { Editor } from 'primereact/editor';
import 'primeicons/primeicons.css';
import { PrimeReactProvider } from 'primereact/api';
import 'primeflex/primeflex.css';
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import { createWorker } from 'tesseract.js';
import { ProgressSpinner } from 'primereact/progressspinner';

export function TemplateDemo() {
	const toast = useRef(null);
	const [totalSize, setTotalSize] = useState(0);
	const [files, setFiles] = useState([]);
	const fileUploadRef = useRef(null);
	const [text, setText] = useState('');
	const [loader, setLoader] = useState(false);

	useEffect(() => {
		(async () => {
			if (files.length === 0) {
				setText('');
			}
			const worker = await createWorker('eng');
			for (let x = 0; x < files.length; x += 1) {
				setLoader(true);
				const ret = await worker.recognize(files[x]);
				console.log(ret.data.text);
				console.log(ret.data, 'ret.data');
				setLoader(false);
				setText(ret.data.text);
			}

			await worker.terminate();
		})();
	}, [files]);

	const onTemplateSelect = (e) => {
		let _totalSize = totalSize;
		let files = e.files;

		Object.keys(files).forEach((key) => {
			_totalSize += files[key].size || 0;
		});

		setTotalSize(_totalSize);
		setFiles(files);
	};

	const onTemplateUpload = (e) => {
		let _totalSize = 0;

		e.files.forEach((file) => {
			_totalSize += file.size || 0;
		});

		setTotalSize(_totalSize);
		toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
	};

	const onTemplateRemove = (file, callback) => {
		setTotalSize(totalSize - file.size);
		callback();
		setFiles([]);
	};

	const onTemplateClear = () => {
		setTotalSize(0);
		setFiles([]);
	};

	const headerTemplate = (options) => {
		const { className, chooseButton, uploadButton, cancelButton } = options;
		const value = totalSize / 10000;
		const formatedValue =
			fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

		return (
			<div
				className={className}
				style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}
			>
				{chooseButton}
				{uploadButton}
				{cancelButton}
				<div className="flex align-items-center gap-3 ml-auto">
					<span>{formatedValue} / 10 MB</span>
					<ProgressBar
						value={value}
						showValue={false}
						style={{ width: '10rem', height: '12px' }}
					></ProgressBar>
				</div>
			</div>
		);
	};

	const itemTemplate = (file, props) => {
		return (
			<div className="flex align-items-center flex-wrap">
				<div className="flex align-items-center" style={{ width: '40%' }}>
					<img alt={file.name} role="presentation" src={file.objectURL} width={100} />
					<span className="flex flex-column text-left ml-3">
						{file.name}
						<small>{new Date().toLocaleDateString()}</small>
					</span>
				</div>
				<Tag value={props.formatSize} severity="warning" className="px-3 py-2" />
				<Button
					type="button"
					icon="pi pi-times"
					className="p-button-outlined p-button-rounded p-button-danger ml-auto"
					onClick={() => onTemplateRemove(file, props.onRemove)}
				/>
			</div>
		);
	};

	const emptyTemplate = () => {
		return (
			<div className="flex align-items-center flex-column">
				<i
					className="pi pi-image mt-3 p-5"
					style={{
						fontSize: '5em',
						borderRadius: '50%',
						backgroundColor: 'var(--surface-b)',
						color: 'var(--surface-d)',
					}}
				></i>
				<span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
					Drag and Drop Image Here
				</span>
			</div>
		);
	};

	const chooseOptions = {
		icon: 'pi pi-fw pi-images',
		iconOnly: true,
		className: 'custom-choose-btn p-button-rounded p-button-outlined',
	};
	const uploadOptions = {
		icon: 'pi pi-fw pi-cloud-upload',
		iconOnly: true,
		className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined',
	};
	const cancelOptions = {
		icon: 'pi pi-fw pi-times',
		iconOnly: true,
		className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined',
	};

	return (
		<div>
			<Toast ref={toast}></Toast>

			<Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />
			<Tooltip target=".custom-upload-btn" content="Upload" position="bottom" />
			<Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />

			<FileUpload
				ref={fileUploadRef}
				name="demo[]"
				accept="image/*"
				maxFileSize={10000000}
				onUpload={onTemplateUpload}
				onSelect={onTemplateSelect}
				onError={onTemplateClear}
				onClear={onTemplateClear}
				headerTemplate={headerTemplate}
				itemTemplate={itemTemplate}
				emptyTemplate={emptyTemplate}
				chooseOptions={chooseOptions}
				uploadOptions={uploadOptions}
				cancelOptions={cancelOptions}
			/>

			{loader ? (
				<div style={{ marginTop: '20px', marginLeft: 'auto', marginRight: 'auto', display: 'flex' }}>
					<ProgressSpinner
						style={{
							width: '50px',
							height: '50px',
						}}
						strokeWidth="8"
						fill="var(--surface-ground)"
						animationDuration=".5s"
					/>
				</div>
			) : null}

			{text.length && files.length ? (
				<div style={{ marginTop: '30px' }}>
					<h2>OCR Output:</h2>
					<Editor
						value={text}
						readOnly
						onTextChange={(e) => setText(e.htmlValue)}
						style={{ height: '320px' }}
					/>
				</div>
			) : null}
		</div>
	);
}

export default function Home() {
	const value = {
		appendTo: 'self',
	};

	const onUpload = (e) => {
		console.log(e.target.value, 'onupload');
		// const fileInput = document.getElementById('fileInput'); // Replace with your HTML element ID
		// const file = fileInput.files[0];

		// const formData = new FormData();
		// formData.append('file', file);

		// fetch('/api/upload', {
		// 	method: 'POST',
		// 	body: formData,
		// })
		// 	.then((response) => response.json())
		// 	.then((data) => console.log(data))
		// 	.catch((error) => console.error(error));
	};
	return (
		<PrimeReactProvider value={value}>
			<div className={styles.container}>
				<Head>
					<title>Create Next App</title>
					<link rel="icon" href="/favicon.ico" />
				</Head>

				<main>
					<h1 className={styles.title}>
						Welcome to{' '}
						<a target="_new" href="https://github.com/tesseract-ocr/tesseract">
							OCR Example!
						</a>
					</h1>

					<div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80vw', maxWidth: '80vw' }}>
						{/* <Toast ref={toast}></Toast> */}
						<TemplateDemo />
					</div>
				</main>

				<style jsx>{`
					main {
						// padding: 5rem 0;
						// flex: 1;
						// display: flex;
						// flex-direction: column;
						// justify-content: center;
						// align-items: center;
					}
					footer {
						width: 100%;
						height: 100px;
						border-top: 1px solid #eaeaea;
						display: flex;
						justify-content: center;
						align-items: center;
					}
					footer img {
						margin-left: 0.5rem;
					}
					footer a {
						display: flex;
						justify-content: center;
						align-items: center;
						text-decoration: none;
						color: inherit;
					}
					code {
						background: #fafafa;
						border-radius: 5px;
						padding: 0.75rem;
						font-size: 1.1rem;
						font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono,
							Bitstream Vera Sans Mono, Courier New, monospace;
					}
				`}</style>

				<style jsx global>{`
					html,
					body {
						padding: 0;
						margin: 0;
						font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell,
							Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
					}
					* {
						box-sizing: border-box;
					}
				`}</style>
			</div>
		</PrimeReactProvider>
	);
}
