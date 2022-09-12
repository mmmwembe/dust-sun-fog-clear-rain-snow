
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
 
 const video = document.getElementById('video');

 const videoButton = document.getElementById('videoButton');
 videoButton.addEventListener('click', changeButtonOption);
 // const liveView = document.getElementById('liveView');

 // if video status is changed to "ended", then change control button to "Play Again"
video.onended = function() {
    $("#videoButton").text("Play Again");
};

// if video status is changed to "paused", then change control button to "Continue Play"
video.onpause = function() {
    $("#videoButton").text("Continue Play");
};

// if video status is changed to "playing", then change control button to "Stop"
video.onplaying = function() {
    $("#videoButton").text("Stop");
};


// video.addEventListener('loadeddata', predictVideo);


video.onplaying = function() {
    // alert("The video is now playing");
    $("#videoButton").text("Stop");
    predictVideo()
    

};
 // Check if webcam access is supported.

 
 // Prediction loop!
 function predictVideo() {
   // Now let's start classifying the stream.
   model.predict(video).then(function (predictions) {
     // Remove any highlighting we did previous frame.
     results_JSON = create_json_from_predictions(predictions)

     datatable.clear();
     datatable.rows.add(results_JSON);
     datatable.draw();
     
     // Call this function again to keep predicting when the browser is ready.
     window.requestAnimationFrame(predictVideo);
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

 function changeButtonOption(){
    video.play()
 }

 start();
 