
 async function start() {

 const demosSection = document.getElementById('demos');

 var model = undefined;


 let results_JSON =[];

 var datatable =  $('#results-datatable').DataTable( {data: results_JSON,
     columns: [{ title: "#" },{ title: "Class/Label" },{ title: "Confidence" }],
     searching: false,ordering: false,lengthChange: false} );

 // Load the TFLite model - Load the model from a custom url with other options (optional).
 model = await tfTask.ImageClassification.CustomModel.TFLite.load({
     model: "https://storage.googleapis.com/2021_tflite_glitch_models/stack-plume-dust-classification/model_classifier.tflite",   
 });

 if (model) {
 demosSection.classList.remove('invisible');
}

 
 
 /********************************************************************
 // Demo 2: Continuously grab image from webcam stream and classify it.
 // Note: You must access the demo on https for this to work:
 ********************************************************************/
 
 const video = document.getElementById('webcam');
 // const liveView = document.getElementById('liveView');
 
 // Check if webcam access is supported.
 function hasGetUserMedia() {
   return !!(navigator.mediaDevices &&
     navigator.mediaDevices.getUserMedia);
 }
 
 // Keep a reference of all the child elements we create
 // so we can remove them easilly on each render.
 var children = [];
 
 
 // If webcam supported, add event listener to button for when user
 // wants to activate it.
 if (hasGetUserMedia()) {
   const enableWebcamButton = document.getElementById('webcamButton');
   enableWebcamButton.addEventListener('click', enableCam);
 } else {
   console.warn('getUserMedia() is not supported by your browser');
 }
 
 
 // Enable the live webcam view and start classification.
 function enableCam(event) {
   if (!model) {
     console.log('Wait! Model not loaded yet.')
     return;
   }
   
   // Hide the button.
   event.target.classList.add('removed');  
   
   // getUsermedia parameters.
   const constraints = {
     video: true
   };
 
   // Activate the webcam stream.
   navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
     video.srcObject = stream;
     video.addEventListener('loadeddata', predictWebcam);
   });
 }
 
 
 // Prediction loop!
 function predictWebcam() {
   // Now let's start classifying the stream.
   model.predict(video).then(function (predictions) {
     // Remove any highlighting we did previous frame.
     results_JSON = create_json_from_predictions(predictions)

     datatable.clear();
     datatable.rows.add(results_JSON);
     datatable.draw();
     
     // Call this function again to keep predicting when the browser is ready.
     window.requestAnimationFrame(predictWebcam);
   });
 }

}

 function create_json_from_predictions(preds){
    var jsonArr = [];
    var json_object
    
    for (var i = 0; i < preds.classes.length; i++) {     
        json_object = [i+1,preds.classes[i].className,((preds.classes[i].score*100).toFixed(0)).toString() + "%"]; 
        jsonArr.push(json_object);
       }
      return jsonArr
 }


 start();
 