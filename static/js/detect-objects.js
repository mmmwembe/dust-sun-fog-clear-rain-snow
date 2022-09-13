async function start() {
    const imageView = document.querySelector("#imageView");    
    const img = document.querySelector("#selected-image");
    var input = document.getElementById("image-selector");
    const resultDiv = document.querySelector(".result");
    let results_JSON =[];

    var datatable =  $('#results-datatable').DataTable( {data: results_JSON,
        columns: [{ title: "#" },{ title: "Class/Label" },{ title: "Confidence" }],
        searching: false,ordering: false,lengthChange: false} );

    // Load the TFLite model - Load the model from a custom url with other options (optional).
    //const model = await tfTask.ImageClassification.CustomModel.TFLite.load({
    //    model: "https://storage.googleapis.com/2021_tflite_glitch_models/stack-plume-dust-classification/model_classifier.tflite",
    //});

    document.querySelector("#predict-button").disabled = true;

    var model = undefined;
    // https://tfhub.dev/tensorflow/lite-model/ssd_mobilenet_v1/1/metadata/2?lite-format=tflite   
    tflite.ObjectDetector.create("https://storage.googleapis.com/2021_tflite_glitch_models/stack-plume-dust-object-detection/obj-detection-dust-model.tflite").then((loadedModel) => {
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
        };
        reader.readAsDataURL(event.target.files[0]);
    }

    document.querySelector("#predict-button").addEventListener("click", async () => {


        if (!model) {
            return;
        }

        // Run inference on an image.
        const predictions = model.detect(img);
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

        }
    }

    return jsonArr 
}

start();