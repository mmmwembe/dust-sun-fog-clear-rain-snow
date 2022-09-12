async function start() {
    const img = document.querySelector("#selected-image");
    var input = document.getElementById("image-selector");
    const resultDiv = document.querySelector(".result");
    let results_JSON =[];

    var datatable =  $('#results-datatable').DataTable( {data: results_JSON,
        columns: [{ title: "#" },{ title: "Class/Label" },{ title: "Confidence" }],
        searching: false,ordering: false,lengthChange: false} );

    // Load the TFLite model - Load the model from a custom url with other options (optional).
    const model = await tfTask.ImageClassification.CustomModel.TFLite.load({
        model: "https://storage.googleapis.com/2021_tflite_glitch_models/stack-plume-dust-classification/model_classifier.tflite",
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

        // Run inference on an image.
        const predictions = await model.predict(img);
        console.log(predictions.classes);

        // Show the results.
        // resultDiv.textContent = predictions.classes.map((c) => `${c.className}: ${c.score.toFixed(3)}`).join(", ");

        results_JSON = create_json_from_predictions(predictions)

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

start();