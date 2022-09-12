from flask import Flask, render_template, session, redirect, url_for, request, jsonify
from flask_bootstrap import Bootstrap
from functools import wraps
from flask_pymongo import PyMongo


app = Flask(__name__)
app.secret_key = b'\xcc^\x91\xea\x17-\xd0W\x03\xa7\xf8J0\xac8\xc5'


# Bootstrap
bootstrap = Bootstrap(app)


@app.route('/')
def home():
  return render_template('classify-images.html')


if __name__ == '__main__':
    
    app.run()
