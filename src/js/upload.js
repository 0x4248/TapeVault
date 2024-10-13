/* SPDX-License-Identifier: GPL-3.0
 * TapeVault
 *
 * upload.js
 *
 * COPYRIGHT NOTICE
 * Copyright (C) 2024 0x4248 and contributors
 * This file and software is licenced under the GNU General Public License v3.0. 
 * Redistribution of this file and software is permitted under the terms of the 
 * GNU General Public License v3.0. 
 *
 * NO WARRANTY IS PROVIDED WITH THIS SOFTWARE. I AM NOT RELIABLE FOR ANY DAMAGES.
 * THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY AND LIABILITY OF ANY KIND.
 *
 * You should have received a copy of the GNU General Public License v3.0
 * along with this program. If you have not please see the following link:
 * https://www.gnu.org/licenses/gpl-3.0.html
*/


document.getElementById("uploadForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const form = document.getElementById("uploadForm");
    const formData = new FormData(form);

    const extra_metadata = extra_metadata_to_json();
    formData.append("extra_metadata", JSON.stringify(extra_metadata));
    let metadata = {
        title: formData.get("title"),
        origin: formData.get("origin"),
        type: formData.get("type"),
        date_archive: formData.get("archive_date"),
        tags: formData.get("tags"),
        folder: formData.get("folder"),
        description: formData.get("description"),
        author: formData.get("author"),
        license: formData.get("license"),
    };
    for (var key in extra_metadata) {
        metadata[key] = extra_metadata[key];

    }

    const thumbnailFile = formData.get("thumbnail");
    if (thumbnailFile) {
        const thumbnailBase64 = await fileToBase64(thumbnailFile);
        metadata.thumbnail = thumbnailBase64;
    }

    const archiveFile = formData.get("archive_data");
    if (!archiveFile.name.endsWith(".tar.gz")) {
        document.getElementById("result").innerText = "Archive must be a .tar.gz file";
        return;
    }
    const archiveBase64 = await fileToBase64(archiveFile);
    metadata.data = archiveBase64;

    const response = await fetch("/api/upload/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(metadata)
    });

    const result = await response.text();
    document.getElementById("result").innerText = `Upload result: ${result}`;
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

function addRow(button) {
    var row = button.parentElement.parentElement;
    var table = row.parentElement;
    var newRow = row.cloneNode(true);
    newRow.querySelector("button").textContent = "-";
    newRow.querySelector("button").onclick = function() {
        table.removeChild(newRow);
    };
    table.appendChild(newRow);
}

function extra_metadata_to_json(){
    var table = document.getElementById("optional-details");
    var data = {};
    for (var i = 1; i < table.rows.length; i++) {
        var key = table.rows[i].cells[0].querySelector("input").value;
        var value = table.rows[i].cells[1].querySelector("input").value;
        if (key && value) {
            data[key] = value;
        }
    }
    return data;
}
