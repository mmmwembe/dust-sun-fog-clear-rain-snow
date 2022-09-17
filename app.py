from flask import Flask, render_template, session, redirect, url_for, request, jsonify
from flask_bootstrap import Bootstrap
from functools import wraps
from flask_pymongo import PyMongo
import base64
from PIL import Image
from io import BytesIO
import os


app = Flask(__name__)
app.secret_key = b'\xcc^\x91\xea\x17-\xd0W\x03\xa7\xf8J0\xac8\xc5'


# Bootstrap
bootstrap = Bootstrap(app)

def getImageNameAndExtension(image_name):

    file_name, ext = os.path.splitext(image_name)

    return file_name, ext


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
        cropped_image_file_path = '/static/images/' + user_id + '/cropped-labels/'+ currentFolder + '/' + file_name +  extension.replace(".", "_") + '_' + label_num + '.png'

        img = Image.open(BytesIO(base64.decodebytes(bytes(cropped_image_dataURL, "utf-8"))))
        img.save(cropped_image_file_path)
        # saveImageBase42StringAsImage(cropped_image_dataURL)

        # static/images/user1/canvas_jsons
        
        # encoded_string = base64.b64encode(cropped_image_dataURL)
   
    return jsonify(result = 'success', url=cropped_image_file_path)

if __name__ == '__main__':
    
    app.run()
