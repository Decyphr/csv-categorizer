<script lang="ts">
	import type { keywordData } from "$lib/types";
  import { downloadCSVFile } from "$lib/utils/csv";

  export let headers: string[] = [];
  export let rows: keywordData[] = [];
  export let allowExport = true;

  function htmlToCSV() {
    let data: keywordData[] = [];
    let filename = "keyword-categories";
    const rows = document.querySelectorAll("table tr");

    for (let i = 0; i < rows.length; i++) {
      let row = [],
        cols = rows[i].querySelectorAll("td, th");

      for (let j = 0; j < cols.length; j++) {
        row.push(cols[j].innerText);
      }

      data.push(row.join(","));
    }

    downloadCSVFile(data.join("\n"), filename);
  }
</script>

<div class="w-full relative rounded text-right">
  <div class="max-h-96 overflow-y-auto">
    <table
      class="w-full relative text-sm text-left text-gray-500 dark:text-gray-400"
    >
      <thead
        class="sticky top-0 left-0 right-0 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
      >
        <tr>
          {#each headers as header}
            <th scope="col" class="px-6 py-3">{header}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each rows as row}
          <tr
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {#each Object.keys(row) as col}
              <td class="px-6 py-4">{row[col]}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if allowExport}
    <button
      on:click={htmlToCSV}
      type="button"
      class="text-white m-4 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
    >
      <svg
        class="w-6 h-6 mr-2 dark:text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"
        /></svg
      >Export
    </button>
  {/if}
</div>
