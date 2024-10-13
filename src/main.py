# SPDX-License-Identifier: GPL-3.0
# TapeVault
#
# main.py
#
# COPYRIGHT NOTICE
# Copyright (C) 2024 0x4248 and contributors
# This file and software is licenced under the GNU General Public License v3.0. 
# Redistribution of this file and software is permitted under the terms of the 
# GNU General Public License v3.0. 
#
# NO WARRANTY IS PROVIDED WITH THIS SOFTWARE. I AM NOT RELIABLE FOR ANY DAMAGES.
# THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY AND LIABILITY OF ANY KIND.
#
# You should have received a copy of the GNU General Public License v3.0
# along with this program. If you have not please see the following link:
# https://www.gnu.org/licenses/gpl-3.0.html

import os
import json

from flask import Flask, request, jsonify, send_file, render_template
import sqlite3
import base64
import datetime
import random	

app = Flask(__name__)

def setup_data():
	os.makedirs("data", exist_ok=True)
	conn = sqlite3.connect("data/index.db")
	c = conn.cursor()
	c.execute("CREATE TABLE IF NOT EXISTS archive_index (uuid TEXT PRIMARY KEY, title TEXT, date_upload TEXT, date_archive TEXT, tags TEXT, folder TEXT, type TEXT, origin TEXT, author TEXT, license TEXT)")
	conn.commit()
	conn.close()

	conn = sqlite3.connect("data/folders.db")
	c = conn.cursor()
	c.execute("CREATE TABLE IF NOT EXISTS folders (folder TEXT PRIMARY KEY, title TEXT, parent TEXT)")
	conn.commit()
	conn.close()

	os.makedirs("data/archives", exist_ok=True)

def get_folders(root="/"):
	conn = sqlite3.connect("data/folders.db")
	c = conn.cursor()
	c.execute("SELECT * FROM folders WHERE parent = ?", (root,))
	folders = c.fetchall()
	conn.close()
	return folders

def get_archives(folder, top=None):
	if top:
		conn = sqlite3.connect("data/index.db")
		c = conn.cursor()
		c.execute("SELECT * FROM archive_index WHERE folder = ? ORDER BY date_upload DESC LIMIT ?", (folder, top))

		archives = c.fetchall()
		conn.close()
		return archives
	else:

		conn = sqlite3.connect("data/index.db")
		c = conn.cursor()
		c.execute("SELECT * FROM archive_index WHERE folder = ?", (folder,))
		archives = c.fetchall()
		conn.close()
		return archives

def get_archive_metadata(uuid):
	with open(f"data/archives/{uuid}/metadata.json", "r") as f:
		return json.load(f)

def get_archive_thumbnail(uuid):
	try:
		return send_file(f"data/archives/{uuid}/thumbnail.jpg")
	except:
		return "404"

def create_id(length=10):
	characters = "ABCDEF1234567890"
	id_ = ""
	for i in range(length):
		id_ += characters[random.randint(0, len(characters)-1)]
	return id_


def create_archive(metadata, thumbnail, data):

	uuid_ = create_id()
	metadata["uuid"] = uuid_
	metadata["date_upload"] = datetime.datetime.now().strftime("%Y-%m-%d")
	thumbnail = metadata.pop("thumbnail")
	data = metadata.pop("data")

	os.makedirs(f"data/archives/{uuid_}", exist_ok=True)
	with open(f"data/archives/{uuid_}/metadata.json", "w") as f:
		json.dump(metadata, f)
	with open(f"data/archives/{uuid_}/thumbnail.jpg", "wb") as f:
		f.write(base64.b64decode(thumbnail))
	with open(f"data/archives/{uuid_}/archive.tar.gz", "wb") as f:
		f.write(base64.b64decode(data))

	folder = metadata["folder"]
	parent = "/".join(folder.split("/")[:-1])


	if parent == "":	
		parent = "/"

	conn = sqlite3.connect("data/folders.db")
	c = conn.cursor()
	c.execute("SELECT * FROM folders WHERE folder = ?", (folder,))
	if not c.fetchall():
		c.execute("INSERT INTO folders (folder, title, parent) VALUES (?, ?, ?)", (folder, folder.split("/")[-1], parent))
	
	conn.commit()
	conn.close()

	conn = sqlite3.connect("data/index.db")
	c = conn.cursor()
	c.execute("INSERT INTO archive_index (uuid, title, date_upload, date_archive, tags, folder, type, origin, author, license) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (metadata["uuid"], metadata["title"], metadata["date_upload"], metadata["date_archive"], metadata["tags"], metadata["folder"], metadata["type"], metadata["origin"], metadata["author"], metadata["license"]))
	conn.commit()
	conn.close()

	return uuid_

@app.route("/api/index/<path:folder>")
def api_index(folder):
	archives = get_archives("/"+folder)
	return jsonify(archives)


@app.route("/api/index/")
def api_index_():
	archives = get_archives("/")
	return jsonify(archives)

@app.route("/api/archive/<uuid>")
def api_archive(uuid):
	metadata = get_archive_metadata(uuid)
	return jsonify(metadata)

@app.route("/api/archive/<uuid>/thumbnail")
def api_archive_thumbnail(uuid):
	return send_file(f"../data/archives/{uuid}/thumbnail.jpg")

@app.route("/api/archive/<uuid>/download/<file>")
def api_archive_download(uuid, file):
	if ".." in file or ".." in uuid:
		return "Why tho? Ur not gunna get anything"
	return send_file(f"../data/archives/{uuid}/{file}")
	
@app.route("/api/folders/")
def api_folders():
	folders = get_folders("/")
	return jsonify(folders)

@app.route("/api/folders/<path:folder>")
def api_folders_folder(folder):
	folders = get_folders("/"+folder)
	print(folders)
	return jsonify(folders)

@app.route("/api/upload/", methods=["POST"])
def api_upload():
	metadata = request.json
	print(metadata)
	thumbnail = metadata["thumbnail"]
	data = metadata["data"]
	uuid_ = create_archive(metadata, thumbnail, data)
	return uuid_

@app.route("/folder/<path:folder>")
def folder(folder):
	return render_template("folder.html")

@app.route("/folder/")
def root_folder():
	return render_template("folder.html")



@app.route("/archive/<uuid>")
def archive(uuid):
	return render_template("archive.html")

@app.route("/upload")
def upload():
	return render_template("upload.html")


@app.route("/js/<path>")
def js(path):
	return send_file(f"js/{path}")


@app.route("/css/<path>")	
def css(path):
	return send_file(f"css/{path}")

@app.route("/")
def index():
	return render_template("index.html")

if __name__ == "__main__":
	setup_data()
	app.run(debug=True, port=5100)
