/* SPDX-License-Identifier: GPL-3.0
 * TapeVault
 *
 * archive.js
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

document.addEventListener("DOMContentLoaded", async function () {
    const path = window.location.pathname;
    const uuid = path.split('/').pop();

    if (!uuid) {
        document.body.innerHTML = "<h1>Archive not found</h1>";
        return;
    }

    const response = await fetch(`/api/archive/${uuid}`);
    const metadata = await response.json();

    document.getElementById("archive-title").textContent = metadata.title;
    document.getElementById("upload-date").textContent = metadata.date_upload;
    document.getElementById("archive-date").textContent = metadata.date_archive;
    document.getElementById("tags").textContent = metadata.tags || "No tags";
    document.getElementById("folder").textContent = metadata.folder;

    if (metadata.description) {
        document.getElementById("description").textContent = metadata.description;
        document.getElementById("description").innerHTML = document.getElementById("description").innerHTML.replace(/\n/g, "<br>");
        document.getElementById("description").innerHTML = document.getElementById("description").innerHTML.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
        document.getElementById("description").innerHTML = document.getElementById("description").innerHTML.replace(/\*(.*?)\*/g, "<i>$1</i>");
        document.getElementById("description").innerHTML = document.getElementById("description").innerHTML.replace(/`(.*?)`/g, "<code>$1</code>");
    } else {
        document.getElementById("description").textContent = "No description available.";
    }

    if (metadata.author) {
        document.getElementById("author").textContent = metadata.author;
    } else {
        document.getElementById("author").textContent = "Unknown";
    }

    if (metadata.license) {
        document.getElementById("license").textContent = metadata.license;
    } else {
        document.getElementById("license").textContent = "No license provided.";
    }

    document.getElementById("download-archive").href = `/api/archive/${uuid}/download/archive.tar.gz`;
    document.getElementById("download-metadata").href = `/api/archive/${uuid}/download/metadata.json`;
    document.getElementById("download-thumbnail").href = `/api/archive/${uuid}/download/thumbnail.jpg`;

    const thumbnailResponse = await fetch(`/api/archive/${uuid}/thumbnail`);
    if (thumbnailResponse.ok) {
        document.getElementById("thumbnail").src = `/api/archive/${uuid}/thumbnail`;
        document.getElementById("thumbnail").style.display = "block";
    } else {
        document.getElementById("thumbnail-container").style.display = "none";
    }
});
