async function start() {
    const imageView = document.querySelector("#imageView");    
    const img = document.querySelector("#selected-image");
    var input = document.getElementById("image-selector");
    const resultDiv = document.querySelector(".result");
    const pct_confidence = document.querySelector("#pct_confidence"); 
    let results_JSON =[];
    var children = [];
    var threshold = 0.5
    let x = 50 

    var colorArray = ['#FF984F','#C2175B','#FF8F6B','#FF0000','#01AEF3','#065FD4','#A2D93D','#FF68C7','#00C7DE','#218838'];

    var datatable =  $('#results-datatable').DataTable( {data: results_JSON,
        columns: [{ title: "#" },{ title: "Class/Label" },{ title: "Confidence" }],
        searching: false,ordering: false,lengthChange: false} );

    // Load the TFLite model - Load the model from a custom url with other options (optional).
    //const model = await tfTask.ImageClassification.CustomModel.TFLite.load({
    //    model: "https://storage.googleapis.com/2021_tflite_glitch_models/stack-plume-dust-classification/model_classifier.tflite",
    //});

    document.querySelector("#predict-button").disabled = true;


    function removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    function remove_bboxes_and_labels(){

        // Remove labels
        var elms1 = document.querySelectorAll("[id='p-label']");
        for(var i = 0; i < elms1.length; i++) 
        // elms[i].style.display='none'; 
          elms1[i]?.remove()

        // Remove labels
        var elms2 = document.querySelectorAll("[id='bbox-highlighter']");
        for(var i = 0; i < elms2.length; i++) 
          // elms[i].style.display='none'; 
            elms2[i]?.remove()        

    }


    function update_caption_and_bbox_colors(){

        // Remove labels
        var elms1 = document.querySelectorAll("[id='p-label']");
        for(var i = 0; i < elms1.length; i++) 

         alert('p-label '+ elms1[i].getAttribute('label'))
         // alert('p-label')

        // Remove labels
        var elms2 = document.querySelectorAll("[id='bbox-highlighter']");
        for(var i = 0; i < elms2.length; i++) 
          elms2[i].setAttribute("border","10px dashed #C2175B")

          
          // alert('highligther ' + elms2[i].getAttribute('label'))     

    }


    // MODEL INFORMATION - Mwembeshi 9/12/2022
    // Google Drive: DUST-SUN-FOG-CLEAR
    // Model Directory: model-object-detection
    // Model URL: /content/drive/MyDrive/DUST-SUN-FOG-CLEAR/model-object-detection/model-obj-detect-dust-sun-fog-clear-blurry-rain-snow.tflite
    // Google Cloud URL: https://storage.googleapis.com/2021_tflite_glitch_models/dust-sun-fog-clear-rain-snow-blurry/model-obj-detect-dust-sun-fog-clear-blurry-rain-snow.tflite

    var model = undefined;
    // https://tfhub.dev/tensorflow/lite-model/ssd_mobilenet_v1/1/metadata/2?lite-format=tflite   
    // https://storage.googleapis.com/2021_tflite_glitch_models/stack-plume-dust-object-detection/obj-detection-dust-model.tflite
    tflite.ObjectDetector.create("https://storage.googleapis.com/2021_tflite_glitch_models/dust-sun-fog-clear-rain-snow-blurry/model-obj-detect-dust-sun-fog-clear-blurry-rain-snow.tflite").then((loadedModel) => {
    model = loadedModel;
    // Show demo section now model is ready to use.
    // demosSection.classList.remove("invisible");
        // alert("Model Loaded Mate!!!")
        document.querySelector("#predict-button").disabled = false;
    });



    // uploadImage()


    input.addEventListener("change", preview_image);

    function preview_image(event) {


        // remove_ptag_elements()
        remove_bboxes_and_labels()

        var reader = new FileReader();
        reader.onload = function () {
            img.src = reader.result;

        };
        reader.readAsDataURL(event.target.files[0]);


    }

    document.querySelector("#predict-button").addEventListener("click", async () => {


        if (!model) {
            return;
        }


        // Get threshold value from pct_confidence element
        x = parseInt(pct_confidence.value)

        //threshold = parseFloat(x/100.0).toFixed(1)

        threshold = x/100.0

        // alert(' pct ' + threshold)



        // Run inference on an image.
        const predictions = model.detect(img);

        // Remove bounding boxes and labels from previous frame
        remove_bboxes_and_labels()

        // results_JSON = create_json_from_predictions(predictions)
        results_JSON = create_json_for_object_detection(predictions)

        // update_caption_and_bbox_colors()

        datatable.clear();
        datatable.rows.add(results_JSON);
        datatable.draw();

    });

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

function create_json_for_object_detection(preds){

    var jsonArr = [];
    var json_object

    for (let i = 0; i < preds.length; i++) {

        const currentObject = preds[i];

        if (currentObject.classes[0].probability > 0.5) {        
        // if (currentObject.classes[0].probability > threshold) {

            label = currentObject.classes[0].className
            confidence = Math.round(parseFloat(currentObject.classes[0].probability) * 100) + "%"; 

            json_object = [i+1,label, confidence]; 
            jsonArr.push(json_object);

            const p = document.createElement("p");
            p.setAttribute("id","p-label");
            p.setAttribute('label', label);
            // p.setAttribute('style', 'background-color:#218838;');

            p.innerText =label +  " - with " + confidence + " confidence.";

            p.style = "margin-left: " + currentObject.boundingBox.originX + "px; margin-top: " + (currentObject.boundingBox.originY - 10) + "px; width: " + (currentObject.boundingBox.width - 10) + "px; top: 0; left: 0;";
      
            const highlighter = document.createElement("div");
            highlighter.setAttribute("id", "bbox-highlighter");
            highlighter.setAttribute("class", "highlighter");
            highlighter.setAttribute('label', label);
            // highlighter.setAttribute('style', 'background-color:darkblue;');

            highlighter.style ="left: " +
              currentObject.boundingBox.originX + "px; top: " +
              currentObject.boundingBox.originY + "px; width: " +
              currentObject.boundingBox.width +   "px; height: " +
              currentObject.boundingBox.height +  "px;";
      
            imageView.appendChild(highlighter);
            imageView.appendChild(p);


        }
    }

    return jsonArr 
}


function uploadImage(){

    var x = new XMLHttpRequest();
    x.open('GET', '/static/project-test-images/gallery/img_mountains.jpg');
    x.responseType = 'blob';
    x.onload = function() {
        var blob = x.response;
        var fr = new FileReader();
        fr.onloadend = function() {
            var dataUrl = fr.result;
            // Paint image, as a proof of concept
            // var img = document.createElement('img');
            img.src = dataUrl;
            document.body.appendChild(img);
        };
        fr.readAsDataURL(blob);
    };
    x.send();

}



const url = "https://cdn.shopify.com/s/files/1/0234/8017/2591/products/young-man-in-bright-fashion_925x_f7029e2b-80f0-4a40-a87b-834b9a283c39.jpg"
const fileName = url.substring(url.lastIndexOf('/')+1)

fetch('https://upload.wikimedia.org/wikipedia/commons/7/77/Delete_key1.jpg')
  .then(res => res.blob()) // Gets the response and returns it as a blob
  .then(blob => {
    // Here's where you get access to the blob
    // And you can use it for whatever you want
    // Like calling ref().put(blob)

    // Here, I use it to make an image appear on the page
    let objectURL = URL.createObjectURL(blob);
    let myImage = new Image();
    myImage.src = objectURL;
    document.getElementById('selected-image').appendChild(myImage)
});









start();