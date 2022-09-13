async function start() {
    const imageView = document.querySelector("#imageView");    
    const img = document.querySelector("#selected-image");
    var input = document.getElementById("image-selector");
    const resultDiv = document.querySelector(".result");
    let results_JSON =[];
    var children = [];

    var datatable =  $('#results-datatable').DataTable( {data: results_JSON,
        columns: [{ title: "#" },{ title: "Class/Label" },{ title: "Confidence" }],
        searching: false,ordering: false,lengthChange: false} );

    // Load the TFLite model - Load the model from a custom url with other options (optional).
    //const model = await tfTask.ImageClassification.CustomModel.TFLite.load({
    //    model: "https://storage.googleapis.com/2021_tflite_glitch_models/stack-plume-dust-classification/model_classifier.tflite",
    //});

    document.querySelector("#predict-button").disabled = true;


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



    input.addEventListener("change", preview_image);

    function preview_image(event) {
        var reader = new FileReader();
        reader.onload = function () {
            img.src = reader.result;


        // Remove any highlighting we did previous frame.
        for (let i = 0; i < children.length; i++) {
            imageView.removeChild(children[i]);
            }
            children.splice(0);



        };
        reader.readAsDataURL(event.target.files[0]);


    }

    document.querySelector("#predict-button").addEventListener("click", async () => {


        if (!model) {
            return;
        }



        // Run inference on an image.
        const predictions = model.detect(img);

          // Remove any highlighting we did previous frame.
        for (let i = 0; i < children.length; i++) {
            imageView.removeChild(children[i]);
        }
        children.splice(0);
        // const predictions = await model.predict(img);
        // console.log(predictions.classes);

        // Show the results.
        // resultDiv.textContent = predictions.classes.map((c) => `${c.className}: ${c.score.toFixed(3)}`).join(", ");

        // results_JSON = create_json_from_predictions(predictions)
        results_JSON = create_json_for_object_detection(predictions)

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

            label = currentObject.classes[0].className
            confidence = Math.round(parseFloat(currentObject.classes[0].probability) * 100) + "%"; 

            json_object = [i+1,label, confidence]; 
            jsonArr.push(json_object);



            const p = document.createElement("p");

            p.innerText =label +  " - with " + confidence + " confidence.";

            p.style = "margin-left: " + currentObject.boundingBox.originX + "px; margin-top: " + (currentObject.boundingBox.originY - 10) + "px; width: " + (currentObject.boundingBox.width - 10) + "px; top: 0; left: 0;";
      
            const highlighter = document.createElement("div");
            highlighter.setAttribute("class", "highlighter");
            highlighter.style =
              "left: " +
              currentObject.boundingBox.originX +
              "px; top: " +
              currentObject.boundingBox.originY +
              "px; width: " +
              currentObject.boundingBox.width +
              "px; height: " +
              currentObject.boundingBox.height +
              "px;";
      
            imageView.appendChild(highlighter);
            imageView.appendChild(p);

            children.push(highlighter);
            children.push(p);






        }
    }

    return jsonArr 
}

start();