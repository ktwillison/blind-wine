import os, copy, json
import json, collections
from flask import Flask, jsonify, request, send_from_directory, make_response
from flask.ext.cors import CORS, cross_origin
app = Flask(__name__, static_url_path='')
cors = CORS(app) 
app.config['CORS_HEADERS'] = 'Content-Type'

# get root
@app.route("/")
def index():
    return app.make_response(open('app/index.html').read())

# send assets (ex. assets/js/random_triangle_meshes/random_triangle_meshes.js)
# blocks other requests, so your directories won't get listed (ex. assets/js will return "not found")
@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory('app/assets/', path)

@app.route('/particle/')
def get_particle_index():
	return app.make_response(open('app/assets/html/three.html').read())

@app.route('/boids/')
def get_boids_index():
	return app.make_response(open('app/assets/html/boids_threejs.html').read())

@app.route('/wine/')
def get_wine_index():
	return app.make_response(open('app/assets/html/wine.html').read())

@app.route('/three/<path:path>')
def get_three_asset(path):
    return send_from_directory('app/assets/html/', path)

@app.route('/api/v1.0/data/wine_data/', methods=['GET'])
@cross_origin(origin='http://fiddle.jshell.net',headers=['Content-Type','Authorization'])
def get_wine_data():
	with open('app/assets/data/wine_data.json') as data_file:
		return json.dumps(json.load(data_file))

@app.route('/trellis', methods=['GET'])
def get_trellis():
	# This method returns the entire dataset
	with open('app/assets/data/trellis.json') as data_file:
		return json.dumps(json.load(data_file))


@app.route('/trellis/limit/<int:n_entries>/', methods=['GET'])
def get_trellis_limit(n_entries):
	# This method returns only the first 'n_entries' entries
	with open('app/assets/data/trellis.json') as data_file:
		return json.dumps(json.load(data_file)[:n_entries])

def make_data_graph(data_list_in):
	# This method should convert the raw trellis data into the graph format
	# Replace the following line with your own code
	return None

@app.route('/graph', methods=['GET'])
def get_graph():
	# This method should return the entire converted graph data
	with open('app/assets/data/trellis.json') as data_file:
		return json.dumps(make_data_graph(json.load(data_file)))

@app.route('/graph/limit/<int:n_entries>/', methods=['GET'])
def get_graph_limit(n_entries):
	# This method should convert and return only the first 'n_entries' entries
	# Replace the following line with your own code
	with open('app/assets/data/trellis.json') as data_file:
		return json.dumps(make_data_graph(json.load(data_file)[:n_entries]))


def make_data_graph(data_list_in):
	idx = 0
	names = collections.OrderedDict()
	for e in data_list_in:
		to = e['to'][:7] # truncate
		fr = e['from'][:7]
		if to not in names:
			names[to] = idx
			idx += 1
		if fr not in names:
			names[fr] = idx
			idx += 1
	edges = [{
				"source": names[e['to'][:7]], 
				"target": names[e['from'][:7]], 
				"value": e['n'], 
				"tags":  [d['tag'] for d in e['data']] 
			} for e in data_list_in
		]
	nodes = [{"name":n} for n in names.keys()]
	return { "nodes": nodes, "edges": edges }

if __name__ == "__main__":
	port = int(os.environ.get("PORT", 5050))
	app.run(host='0.0.0.0', port=port, debug=True)



# set debug=True if you want to have auto-reload on changes
# this is great for developing