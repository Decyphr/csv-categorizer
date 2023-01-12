<script lang="ts">
	import { v4 as uuidv4 } from 'uuid';
	import { csvToArray, getCsvHeaders } from '$lib/utils/csv';
	import DataTable from '$lib/components/DataTable.svelte';
	import type { keywordData } from '$lib/types';

	type category = {
		id: string;
		title: string;
		identifiers: string;
    volume: number;
	};

  let tableData: { headers: string[]; rows: keywordData[] } = {
		headers: ['Keyword', 'Volume', 'Category'],
		rows: []
	};

	let formErrors = {
		categories: false,
		keywordHeader: false,
		volumeHeader: false
	};

	let categories: category[] = [
		{
			id: uuidv4(),
			title: '',
			identifiers: '',
      volume: 0
		}
	];

	let keywordHeader: string = '';
	let volumeHeader: string = '';

	let csvData: any[] = [];
	let uploadedCsvHeaders: string[] = [];
	let showMappingFields = false;

	function readData() {
		const fileInput = document.querySelector('#csv-file') || null;

		if (fileInput) {
			const reader = new FileReader();

			reader.onload = function (e) {
				const text = e.target.result;

				if (typeof text === 'string') {
					csvData = csvToArray(text);

					// get headers in order to map keywords & volume fields
					uploadedCsvHeaders = getCsvHeaders(text);
					showMappingFields = true;
				}
			};

			const file = fileInput.files[0] || null;

			if (file) {
				reader.readAsText(file);
			}
		}
	}

	function addCategory() {
		categories = [
			...categories,
			{
				id: uuidv4(),
				title: '',
				identifiers: '',
        volume: 0
			}
		];
	}

	function removeCategory(id: string) {
		if (categories.length === 1) {
			alert('You must provide at least one category.');
			return;
		}

		const category = categories.find((category) => category.id === id);

		if (!category) {
			throw new Error('No category with id found.');
		}

		categories = categories.filter((category) => category.id != id);
	}

	async function handleSubmit(e: Event) {
		// validate form
		if (
			categories.length < 1 ||
			!categories[0].title ||
			!categories[0].identifiers ||
			!keywordHeader ||
			!volumeHeader
		) {
			formErrors = {
				categories: categories.length < 1 || !categories[0].title || !categories[0].identifiers,
				keywordHeader: !keywordHeader,
				volumeHeader: !volumeHeader
			};
		}

    let keywordData: keywordData[] = csvData.map(row => {
      return {
        keywords: row[keywordHeader],
        volume: row[volumeHeader],
        category: ''
      }
    })

		keywordData.forEach((row: keywordData) => {
			let keyword = row.keywords.trim().toLowerCase();

			categories.forEach((category) => {
				// trim any trailing commas and whitespace from identifiers
				// then create array
				let identifiersArr = category.identifiers.replace(/,\s*$/, '').split(',');

				identifiersArr.forEach((identifier) => {
					let searchTerm = identifier.trim().toLowerCase();

					if (keyword.search(searchTerm) >= 0 && !row.category) {
						// matched keyword - assign category & increase category total by keyword value
						row.category = category.title;
						category.volume += Number(row.volume) || 0;
					}
				});
			});
		});

    tableData.rows = keywordData;
	}
</script>

<form on:submit|preventDefault={handleSubmit} method="POST">
	<div class="shadow sm:overflow-hidden sm:rounded-md">
		<div class="space-y-6 bg-white px-4 py-5 sm:p-6">
			<div>
				<div class="mb-4"><span class="text-xl font-bold text-slate-700">File Upload</span></div>
				<span class="block text-sm font-medium text-slate-700">CSV File</span>
				<div
					class="mt-1 flex justify-center rounded-md border-2 border-dashed border-slate-300 px-6 pt-5 pb-6"
				>
					<div class="space-y-1 text-center">
						<svg
							class="mx-auto h-12 w-12 text-slate-400"
							stroke="currentColor"
							fill="none"
							viewBox="0 0 48 48"
							aria-hidden="true"
						>
							<path
								d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						<div class="flex text-sm text-slate-600">
							<label
								for="csv-file"
								class="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
							>
								<span>Upload a file</span>
								<input
									id="csv-file"
									name="csv-file"
									type="file"
									class="sr-only"
									accept="csv"
									on:change={readData}
								/>
							</label>
							<p class="pl-1">or drag and drop</p>
						</div>
						<p class="text-xs text-slate-500">CSV up to 10MB</p>
					</div>
				</div>
			</div>
			{#if showMappingFields}
				<div class="grid grid-cols-12 gap-6">
					<div class="col-span-12 sm:col-span-6">
						<label for="keyword-header" class="block text-sm font-medium text-gray-700"
							>Keyword Column Header
							<select
								id="keyword-header"
								name="keyword-header"
								class="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
								bind:value={keywordHeader}
							>
								<option value="">Select Keyword Header</option>
								{#each uploadedCsvHeaders as option}
									<option value={option}>{option}</option>
								{/each}
							</select>
						</label>
					</div>
					<div class="col-span-12 sm:col-span-6">
						<label for="volume-header" class="block text-sm font-medium text-gray-700"
							>Volume Column Header
							<select
								id="volume-header"
								name="volume-header"
								class="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
								bind:value={volumeHeader}
							>
								<option value="">Select Volume Header</option>
								{#each uploadedCsvHeaders as option}
									<option value={option}>{option}</option>
								{/each}
							</select>
						</label>
					</div>
				</div>
			{/if}
			<div><span class="text-xl font-bold text-slate-700">Categories</span></div>
			{#each categories as category, idx (category.id)}
				<div class="grid grid-cols-12 gap-6">
					<div class="col-span-12 sm:col-span-3">
						<label for={'category-' + category.id} class="block text-sm font-medium text-slate-700"
							>Category Title</label
						>
						<input
							type="text"
							name={'category-' + category.id}
							id={'category-' + category.id}
							autocomplete="given-name"
							class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							bind:value={category.title}
						/>
					</div>

					<div class="col-span-12 sm:col-span-8">
						<label
							for={'category-identifiers-' + category.id}
							class="block text-sm font-medium text-slate-700">Identifiers</label
						>
						<input
							type="text"
							name={'category-identifiers-' + category.id}
							id={'category-identifiers-' + category.id}
							autocomplete="family-name"
							class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							bind:value={category.identifiers}
						/>
					</div>
					<div class="col-span-12 sm:col-span-1 self-end justify-self-end">
						<button
							type="button"
							class="text-sm rounded-md border border-dashed border-rose-300 px-2 py-1 text-rose-500 transition hover:border-rose-500 hover:text-rose-500 hover:bg-rose-50 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
							disabled={categories.length === 1}
							on:click={() => removeCategory(category.id)}>Remove</button
						>
					</div>
				</div>
			{/each}

			<div class="w-full text-right">
				<button
					type="button"
					class="mt-1 rounded-md border border-indigo-300 px-4 py-1 text-indigo-500 transition hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50"
					on:click={addCategory}>+ Add a Category</button
				>
			</div>
		</div>
		<div class="bg-slate-50 px-4 py-3 text-right sm:px-6">
			<button
				type="submit"
				class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				>Categorize</button
			>
		</div>
	</div>
</form>

{#if tableData.rows.length}
  <div class="mt-4 overflow-hidden rounded-md">
	  <DataTable headers={tableData.headers} rows={tableData.rows} />
  </div>
{/if}
