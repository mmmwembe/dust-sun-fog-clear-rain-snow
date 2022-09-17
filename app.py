from flask import Flask,flash, render_template, session, redirect, url_for, request, jsonify
from werkzeug.utils import secure_filename
from flask_bootstrap import Bootstrap
from functools import wraps
from flask_pymongo import PyMongo
import base64
from PIL import Image
from io import BytesIO
import os


ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
UPLOAD_FOLDER = 'static/uploads/'

app = Flask(__name__)
app.secret_key = b'\xcc^\x91\xea\x17-\xd0W\x03\xa7\xf8J0\xac8\xc5'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024



# If directory doe not exist, create it
isExist = os.path.exists(UPLOAD_FOLDER)
if not isExist:
  # Create a new directory because it does not exist 
  os.makedirs(UPLOAD_FOLDER)

# Bootstrap
bootstrap = Bootstrap(app)


def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def getImageNameAndExtension(image_name):
    file_name, ext = os.path.splitext(image_name)
    return file_name, ext

def get_filename_and_extension(file_path):
  """ This function splits a filepath to a filename and extension
    It takes as an argument the file path and outputs the filename and the extension"""
  filename, ext = os.path.splitext(file_path)
  return filename, ext

def get_images_list(dir):
  images_list_raw = os.listdir(dir)
  images_list_filtered =[]
  for image in images_list_raw:
    if image.lower().endswith(tuple(["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"])):
       images_list_filtered.append(image) 
  return images_list_filtered

@app.route('/')
def home():
  return render_template('detect-objects.html')

@app.route('/labeling')
def labeling():
  return render_template('labeling.html')


@app.route('/saveCroppedImage', methods=['POST','GET'])
def saveCroppedImage():

    if request.method =='POST':

        user_id = request.form['user_id']
        image_name= request.form['image_name']
        label_num= request.form['label_num']
        currentFolder= request.form['current_folder']
        file_name, extension = getImageNameAndExtension(image_name)

        cropped_image_dataURL = request.form['imgBase64']
        # print(cropped_image_dataURL)
        # save cropped imageBase64 string as PNG image
        # cropped_image_file_path = 'static/images/' + user_id + '/cropped-labels/'+ currentFolder + '/' + file_name +  extension.replace(".", "-") + '-' + label_num + '.png'
        cropped_image_file_path = 'static/images/'  + file_name + extension.replace(".", "-") + '-' + label_num + '.png'

        img = Image.open(BytesIO(base64.decodebytes(bytes(cropped_image_dataURL, "utf-8"))))
        img.save(cropped_image_file_path)
        # saveImageBase42StringAsImage(cropped_image_dataURL)

        # static/images/user1/canvas_jsons
        
        # encoded_string = base64.b64encode(cropped_image_dataURL)
   
    return jsonify(result = 'success', url=cropped_image_file_path)


@app.route('/', methods=['POST'])
def upload_image():
	if 'files[]' not in request.files:
		flash('No file part')
		return redirect(request.url)
	files = request.files.getlist('files[]')
	file_names = []
	for file in files:
		if file and allowed_file(file.filename):
			filename = secure_filename(file.filename)
			file_names.append(filename)
			file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
		#else:
		#	flash('Allowed image types are -> png, jpg, jpeg, gif')
		#	return redirect(request.url)

	images_in_dir = get_images_list(app.config['UPLOAD_FOLDER'])

	return render_template('labeling.html', filenames=file_names, images_in_dir = images_in_dir)

@app.route('/display/<filename>')
def display_image(filename):
	#print('display_image filename: ' + filename)
	return redirect(url_for('static', filename='uploads/' + filename), code=301) 


if __name__ == '__main__':
    
    app.run()
