$("form[name=signup_form").submit(function(e) {

  var $form = $(this);
  var $error = $form.find(".error");
  var data = $form.serialize();

  $.ajax({
    url: "/user/signup",
    type: "POST",
    data: data,
    dataType: "json",
    success: function(resp) {
      window.location.href = "/dashboard/";
    },
    error: function(resp) {
      $error.text(resp.responseJSON.error).removeClass("error--hidden");
    }
  });

  e.preventDefault();
});

$("form[name=login_form").submit(function(e) {

  var $form = $(this);
  var $error = $form.find(".error");
  var data = $form.serialize();

  $.ajax({
    url: "/user/login",
    type: "POST",
    data: data,
    dataType: "json",
    success: function(resp) {
      window.location.href = "/dashboard/";
    },
    error: function(resp) {
      $error.text(resp.responseJSON.error).removeClass("error--hidden");
    }
  });

  e.preventDefault();
});


$("form[name=add_project_form").submit(function(e) {

  var $form = $(this);
  var $error = $form.find(".error");
  var data = $form.serialize();

  $.ajax({
    url: "/project/add_project",
    type: "POST",
    data: data,
    dataType: "json",
    success: function(resp) {

      // alert(resp);
      // $.each(resp, function(key,value) { alert(key + '---' + value); });
      // window.location.href = "/dashboard/";
      window.location.href ="/add_project_photo/";

    },
    error: function(resp) {
      // $error.text(resp.responseJSON.error).removeClass("error--hidden");
      // alert('error '  + resp);

      for (key in resp){
        alert("key: " + key + " value :" + Object.keys(resp[key]).join(' '));
    }


    }
  });

  e.preventDefault();
});


function myFunction() { 
  alert("This is from the Javascript in scripts.js");
  document.getElementById("myForm").submit(); 
}


