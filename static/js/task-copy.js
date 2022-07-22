/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

var currentview;

var mycondition = condition;  // these two variables are passed by the psiturk server process
var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to


// All pages to be loaded
var pages = [
    "instruct-1.html",
    "check_video.html",
    "payment.html",
    "suspend.html",
    "response_video.html",
    "pre-interest.html",
    "post-interest.html",
    "questionSliders.html",
    "questionSliders-copy.html",
    "questionFreeResponse.html",
    "responseType.html",
    "demographics.html",
    "check_question.html"
];


//window.resizeTo(screen.width, screen.height);

/*const init = (aysnc () => {
    await psiTurk.preloadPages(pages);
    })()*/

// async function init() {
//     await psiTurk.preloadPages(pages);
// }

//psiTurk.preloadPages(pages);




// psiTurk 3 version //
const init = (async () => {
    await psiTurk.preloadPages(pages);
})()
////////////////////////

// psiTurk 2 version //
// psiTurk.preloadPages(pages);
///////////////////////




var instructionPages = [ // add as a list as many pages as you like
    "instruct-1.html"
];


/********************
 * HTML manipulation
 *
 * All HTML files in the templates directory are requested
 * from the server when the PsiTurk object is created above. We
 * need code to get those pages from the PsiTurk object and
 * insert them into the document.
 *
 ********************/




var Suspend = function() {

    psiTurk.finishInstructions();
    
    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";
    
    // Load the questionnaire snippet 
    psiTurk.showPage('suspend.html');
    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'suspend', 'status':'begin'});
};







/***********************
 * Payment Information *
 ***********************/
var PaymentQuestionnaire = function() {

    psiTurk.finishInstructions();
    
    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {

        psiTurk.recordUnstructuredData("condition",mycondition);
        //alert(mycondition);

        psiTurk.recordTrialData({'phase':'paymentquestionnaire', 'status':'submit'});

        // $('input[name=email]').each( function(i, val) {
        //     psiTurk.recordUnstructuredData(this.id, this.value);
        // });
        
        // $('input[name=cwid]').each( function(i, val) {
        //     psiTurk.recordUnstructuredData(this.id, this.value);
        // });
        
        $('input[name=age]').each( function(i, val) {
            psiTurk.recordUnstructuredData(this.id, this.value);
        });

        var radio_groups = {}

        $(":radio").each(function(i, val){
            radio_groups[this.name] = true;
        });
        for(group in radio_groups){
            //alert("Recording: "+group+" "+$(":radio[name='"+group+"']:checked").val());
            psiTurk.recordUnstructuredData(group,$(":radio[name='"+group+"']:checked").val());
        }
    };

    prompt_resubmit = function() {
        replaceBody(error_message);
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
        replaceBody("<h1>Trying to resubmit...</h1>");
        reprompt = setTimeout(prompt_resubmit, 10000);
	
        psiTurk.saveData({
            success: function() {
        	    clearInterval(reprompt);       
            }, 
            error: prompt_resubmit
        });
    };
    
    // Load the questionnaire snippet 
    psiTurk.showPage('payment.html');
    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'paymentquestionnaire', 'status':'begin'});

    var r1 = false;

    (function() {
        var empty = true;
        $('#age').keyup(function() {

            empty = false;
            $('#age').each(function() {
                if ($(this).val() == '' || $(this).val() < 18 || $(this).val() > 99) {
                    empty = true;
                }
            });

            if (empty) {
                r1 = false;
                checkenable();
            } else {
                r1 = true;
                checkenable();
            }
        });
    })();
    
    // (function() {

    //     var empty = true;
    //     $('#cwid').keyup(function() {

    //             empty = false;
    //             $('#cwid').each(function() {
    //                 if ($(this).val() == '') {
    //                     empty = true;
    //                 }
    //             });

    //             if (empty) {
    //                 r2 = false;
    //                 checkenable();
    //             } else {
    //                 r2 = true;
    //                 checkenable();
    //             }
    //     });
    // })(); 

    // (function() {
    //     var empty = true;
    //     $('#email').keyup(function() {
    //         empty = false;
    //         $('#email').each(function() {
    //             if ($(this).val() == '') {
    //                 empty = true;
    //             }
    //         });

    //         if (empty) {
    //             r3 = false;
    //             checkenable();
    //         } else {
    //             r3 = true;
    //             checkenable();
    //         }
    //     });
    // })(); 
    
    function checkenable() {
        if (r1){
            $('#next').removeAttr('disabled');
        } else {
            $('#next').prop('disabled', true);
        }
    }
    
    $("#next").click(function () {
    	record_responses();
        currentview = new VidCheck();
    }); 
};

/***************
 * Video Check *
 ***************/

 var VidCheck = function() {
    
    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    var ppcounter = 0;
    var rscounter = 0;

    record_responses = function() {
        psiTurk.recordTrialData({'phase':'vidcheck', 'status':'submit'});	
    };

    prompt_resubmit = function() {
        replaceBody(error_message);
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
        replaceBody("<h1>Trying to resubmit...</h1>");
        reprompt = setTimeout(prompt_resubmit, 10000);
        psiTurk.saveData({
            success: function() {
                clearInterval(reprompt);
            }, 
            error: prompt_resubmit
        });
    };
    
    // Load the questionnaire snippet 
    psiTurk.showPage('check_video.html');
    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'vidcheck', 'status':'begin'});

    var r1, r2, r3 = false;

    function checkenable(){
        if (r1 && r2 && r3){
            $('#next').removeAttr('disabled');
        } else {
            $('#next').prop('disabled', true);
        }
    }

    $("input[name=seeword]").keyup(function(){
        var word = $("input[name=seeword]").val();
        word = word.toLowerCase();
        r1 = false;
        if (word.includes("amazing")) {
            r1=true;
        }
        checkenable();
    });

    $("input[name=hearword]").keyup(function(){
        var word = $("input[name=hearword]").val();
        word = word.toLowerCase();
        r2 = false;
        if (word.includes("forest")) {
            r2 = true;
        }
        checkenable();
    });
    
    $("#video1").on('ended', function() {
        psiTurk.recordTrialData({'phase':'vidcheck', 'status':'video ended'});
        r3 = true;
        checkenable();
    });
    
    $("#ppbutton").click(function () {
        psiTurk.recordTrialData({'phase':'vidcheck', 'status':'play/pause clicked: '+ppcounter});
        ppcounter += 1;
    });
    
    $("#rsbutton").click(function () {
        psiTurk.recordTrialData({'phase':'vidcheck', 'status':'restart clicked: '+rscounter});
        rscounter += 1;
    });

    $("#next").click(function () {
        record_responses();
        currentview = new Video();
    });
};

/***************
 * Pre-Interest   *
 ***************/

// var PreInterest = function() {

//     var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

//     record_responses = function() {

//         psiTurk.recordTrialData({'phase':'pre-interest', 'status':'submit'});

//         var radio_groups = {}
//         $(":radio").each(function(i, val){
//             radio_groups[this.name] = true;
//         })

//             for(group in radio_groups){
//                 //alert("Recording: "+group+" "+$(":radio[name='"+group+"']:checked").val());
//                 psiTurk.recordUnstructuredData(group,$(":radio[name='"+group+"']:checked").val());
//             }
//     };


//     prompt_resubmit = function() {
//         replaceBody(error_message);
//         $("#resubmit").click(resubmit);
//     };

//     resubmit = function() {
//         replaceBody("<h1>Trying to resubmit...</h1>");
//         reprompt = setTimeout(prompt_resubmit, 10000);
//         psiTurk.saveData({
//             success: function() {
//                 clearInterval(reprompt);
//             },
//             error: prompt_resubmit
//         });
//     };


//     // Load the questionnaire snippet
//     psiTurk.showPage('pre-interest.html');


//     function hasClass(element, cls) {
//         return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
//     }


//     $(":radio").change(function(i, val){
//         var names = {};
//         $("input:radio").each(function(){
//             names[$(this).attr('name')] = true;
//         });
//         var count = 0;
//         $.each(names, function() {
//             count++;
//         });
//         if ($("input:radio:checked").length == count) {
//             $('#next').removeAttr('disabled');
//         }
//     });


//     window.scrollTo(0, 0);

//     psiTurk.recordTrialData({'phase':'pre-interest', 'status':'begin'});


//     $("#next").click(function () {
//         record_responses();
//         currentview = new Video();
//     });
// };




/******************
 *     Video      *
 ******************/
var Video = function() {
    psiTurk.finishInstructions();

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    var ppcounter = 0;
    var rscounter = 0;

    record_responses = function() {
        psiTurk.recordTrialData({'phase':'response_video', 'status':'submit'});
    };

    prompt_resubmit = function() {
        replaceBody(error_message);
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
        replaceBody("<h1>Trying to resubmit...</h1>");
        reprompt = setTimeout(prompt_resubmit, 10000);
        psiTurk.saveData({
            success: function() {
                clearInterval(reprompt);
            },
            error: prompt_resubmit
        });
    };

    // Load the questionnaire snippet
    psiTurk.showPage('response_video.html');
    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'response_video', 'status':'begin'});

    //TODO
    //console.log("mycondition:  " + mycondition);
    if (mycondition % 3 == 0) {
        $("#mp4src").attr("src", "/static/videos/US_final_older_aggressive.mp4")
        $("#oggsrc").attr("src", "/static/videos/US_final_older_aggressive.ogv")
    }
    else if (mycondition % 3 == 1) {
        $("#mp4src").attr("src", "/static/videos/US_final_older_argumentative.mp4")
        $("#oggsrc").attr("src", "/static/videos/US_final_older_argumentative.ogv")
    }
    else if (mycondition % 3 == 2) {
        $("#mp4src").attr("src", "/static/videos/US_final_older_control.mp4")
        $("#oggsrc").attr("src", "/static/videos/US_final_older_control.ogv")
    }

    $("#video2").load();

    $("#video2").on('ended', function() {
        psiTurk.recordTrialData({'phase':'response_video', 'status':'video ended'});
        $('#next').removeAttr('disabled');
    });

    $("#ppbutton").click(function () {
        psiTurk.recordTrialData({'phase':'response_video', 'status':'play/pause clicked: '+ppcounter});
        ppcounter += 1;
    });

    $("#rsbutton").click(function () {
        psiTurk.recordTrialData({'phase':'response_video', 'status':'restart clicked: '+rscounter});
        rscounter += 1;
    });

    $("#next").click(function () {
        record_responses();
        currentview = new Question3();
    });
};



/******************************************
 *  Question 3 - Free response questions  *
 ******************************************/

var Question3 = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {

        // CHANGE
        psiTurk.recordTrialData({'phase':'free_response', 'status':'submit'});

        $('input[name=event_description]').each( function(i, val) {
            psiTurk.recordUnstructuredData(this.name, this.value);
        });

        $('input[name=sara_impression]').each( function(i, val) {
	    psiTurk.recordUnstructuredData(this.name, this.value);
        });

    };


    prompt_resubmit = function() {
        replaceBody(error_message);
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
        replaceBody("<h1>Trying to resubmit...</h1>");
        reprompt = setTimeout(prompt_resubmit, 10000);
        psiTurk.saveData({
            success: function() {
                clearInterval(reprompt);
            },
            error: prompt_resubmit
        });
    };


    // Load the questionnaire snippet
    psiTurk.showPage('questionFreeResponse.html');

    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }


    $("input:text").on('input', function(){
        var empty = false;
        $("input:text").each(function(){
            if ($(this).val().trim().length === 0) {
                empty = true;
            }
        });
        
        if (!empty) {
            $('#next').removeAttr('disabled');
        } else {
            $('#next').attr('disabled', 'disabled');
        }
    });


    window.scrollTo(0, 0);
    // CHANGE
    psiTurk.recordTrialData({'phase':'free_response', 'status':'begin'});


    $("#next").click(function () {
        record_responses();
        currentview = new Question2();
    });

};


/*********************************
 * Question 2 - Slider questions *
 *********************************/

var Question2 = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {
        psiTurk.recordTrialData({'phase':'slider_questions', 'status':'submit'});
        for(i=1; i<=3; i++){
	        var variable = document.getElementById(i);
    	    psiTurk.recordUnstructuredData("slider_question_"+(i),$("input[name='"+i+"']").val());
            // console.log("slider_question_"+(i),$("input[name='"+i+"']").val());

        }
    };

    prompt_resubmit = function() {
        replaceBody(error_message);
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
	    replaceBody("<h1>Trying to resubmit...</h1>");
	    reprompt = setTimeout(prompt_resubmit, 10000);

        psiTurk.saveData({
            success: function() {
                clearInterval(reprompt);
            },
            error: prompt_resubmit
        });
    };


    // Load the questionnaire snippet
    psiTurk.showPage('questionSliders-copy.html');

    function hasClass(element, cls) {
        console.log(element)
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    function checkenable(){
        allclicked=true;

        for(i=1; i<=3; i++) {
            var slider = document.getElementById(i);
            if(hasClass(slider, "not-clicked")) {
                allclicked = false;
                //console.log("slider " + i + " not clicked");
            }
        }

        if(allclicked){
	        $('#next').removeAttr('disabled');
        } else {
	        $('#next').attr('disabled', 'disabled');
	    }
    }


    $(".not-clicked").click(function(e){
        console.log(this.className);
	    $(this).removeClass('not-clicked');
	    $(this).addClass('clicked');
        console.log(this.className);
        checkenable();
    });

    $(".check").click(function(e){
	    checkenable();
    });

    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'slider_questions', 'status':'begin'});

    $("#next").click(function () {
        record_responses();
	    currentview = new PostInterest();
    })
};



/*******************
 * Post-Interest   *
 *******************/

var PostInterest = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {

        psiTurk.recordTrialData({'phase':'post-interest', 'status':'submit'});

        var radio_groups = {}
        $(":radio").each(function(i, val){
            radio_groups[this.name] = true;
        })

        for(group in radio_groups){
            //alert("Recording: "+group+" "+$(":radio[name='"+group+"']:checked").val());
            psiTurk.recordUnstructuredData(group,$(":radio[name='"+group+"']:checked").val());
        }
    };


    prompt_resubmit = function() {
        replaceBody(error_message);
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
        replaceBody("<h1>Trying to resubmit...</h1>");
        reprompt = setTimeout(prompt_resubmit, 10000);
        psiTurk.saveData({
            success: function() {
                clearInterval(reprompt);
            },
            error: prompt_resubmit
        });
    };


    // Load the questionnaire snippet
    psiTurk.showPage('post-interest.html');


    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }


    $(":radio").change(function(i, val){
        var names = {};
        $("input:radio").each(function(){
            names[$(this).attr('name')] = true;
        });
        var count = 0;
        $.each(names, function() {
            count++;
        });
        if ($("input:radio:checked").length == count) {
            $('#next').removeAttr('disabled');
        }
    });


    window.scrollTo(0, 0);

    psiTurk.recordTrialData({'phase':'post-interest', 'status':'begin'});


    $("#next").click(function () {
        record_responses();
        currentview = new ResponseType();
    });
};




/******************************************
 *  response type questions  *
 ******************************************/

var ResponseType = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {

        // CHANGE
        psiTurk.recordTrialData({'phase':'response_type', 'status':'submit'});

        var radio_groups = {}
        $(":radio").each(function(i, val){
            radio_groups[this.name] = true;
        })

        for(group in radio_groups){
            //alert("Recording: "+group+" "+$(":radio[name='"+group+"']:checked").val());
            psiTurk.recordUnstructuredData(group,$(":radio[name='"+group+"']:checked").val());
        }

    };


    prompt_resubmit = function() {
        replaceBody(error_message);
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
        replaceBody("<h1>Trying to resubmit...</h1>");
        reprompt = setTimeout(prompt_resubmit, 10000);
        psiTurk.saveData({
            success: function() {
                clearInterval(reprompt);
            },
            error: prompt_resubmit
        });
    };


    // Load the questionnaire snippet
    psiTurk.showPage('responseType.html');

    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }


    $(":radio").change(function(i, val){
        var names = {};
        $("input:radio").each(function(){
            names[$(this).attr('name')] = true;
        });
        var count = 0;
        $.each(names, function() {
            count++;
        });
        if ($("input:radio:checked").length == count) {
            $('#next').removeAttr('disabled');
        }
    });


    window.scrollTo(0, 0);
    // CHANGE
    psiTurk.recordTrialData({'phase':'response_type', 'status':'begin'});


    $("#next").click(function () {
        record_responses();
        currentview = new QuestionCheck();
    });

};

/*******************
 * Check_Question   *
 *******************/
var QuestionCheck = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {

        // CHANGE
        psiTurk.recordTrialData({'phase':'question_check', 'status':'submit'});

        var radio_groups = {}
        $(":radio").each(function(i, val){
            radio_groups[this.name] = true;
        })

        for(group in radio_groups){
            //alert("Recording: "+group+" "+$(":radio[name='"+group+"']:checked").val());
            psiTurk.recordUnstructuredData(group,$(":radio[name='"+group+"']:checked").val());
        }

    };


    prompt_resubmit = function() {
        replaceBody(error_message);
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
        replaceBody("<h1>Trying to resubmit...</h1>");
        reprompt = setTimeout(prompt_resubmit, 10000);
        psiTurk.saveData({
            success: function() {
                clearInterval(reprompt);
            },
            error: prompt_resubmit
        });
    };


    // Load the questionnaire snippet
    psiTurk.showPage('check_question.html');

    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }


    $(":radio").change(function(i, val){
        var names = {};
        $("input:radio").each(function(){
            names[$(this).attr('name')] = true;
        });
        var count = 0;
        $.each(names, function() {
            count++;
        });
        if ($("input:radio:checked").length == count) {
            $('#next').removeAttr('disabled');
        }
    });


    window.scrollTo(0, 0);
    // CHANGE
    psiTurk.recordTrialData({'phase':'question_check', 'status':'begin'});


    $("#next").click(function () {
        record_responses();
        currentview = new Demographics();
    });

}

/****************
 * Demographics *
 ****************/

// CHANGE 
var Demographics = function() {   
    
    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {
    
        // CHANGE
        psiTurk.recordTrialData({'phase':'demographics', 'status':'submit'});

        var radio_groups = {}
        $(":radio").each(function(i, val){
            radio_groups[this.name] = true;
        })

        for(group in radio_groups){
            //alert("Recording: "+group+" "+$(":radio[name='"+group+"']:checked").val());
            psiTurk.recordUnstructuredData(group,$(":radio[name='"+group+"']:checked").val());
            // console.log(group,$(":radio[name='"+group+"']:checked").val());
        }
            
        $('input[name=other_gender_text]').each( function(i, val) {
            psiTurk.recordUnstructuredData(this.name, this.value);
        });
        $('input[name=other_education_text]').each( function(i, val) {
            psiTurk.recordUnstructuredData(this.name, this.value);
        });
        $('input[name=other_nation_text]').each( function(i, val) {
            psiTurk.recordUnstructuredData(this.name, this.value);
        });
        
        
        
    };


    prompt_resubmit = function() {
        replaceBody(error_message);
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
        replaceBody("<h1>Trying to resubmit...</h1>");
        reprompt = setTimeout(prompt_resubmit, 10000);
        psiTurk.saveData({
            success: function() {
                clearInterval(reprompt);                
            }, 
            error: prompt_resubmit
        });
    };

    
    // Load the questionnaire snippet 
    psiTurk.showPage('demographics.html');
    
    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
    
        
    $(":radio").change(function(i, val){
        var names = {};
        $("input:radio").each(function(){
            names[$(this).attr('name')] = true;
        });
        var count = 0;
        $.each(names, function() {
            count++;
        });
        if ($("input:radio:checked").length == count) {
            $('#next').removeAttr('disabled');
        }
    });

    
    window.scrollTo(0, 0);
    // CHANGE
    psiTurk.recordTrialData({'phase':'demographics', 'status':'begin'});

    
    $("#next").click(function () {
        record_responses();
        psiTurk.saveData({
            success: function(){
                psiTurk.completeHIT(); 
            }, 
            error: prompt_resubmit});
    });  
    
};

// // Task object to keep track of the current phase
// var currentview;



/*******************
 * Run Task
 ******************/
// *  psiTurk 3 version /////////
$(window).on('load', async () => {
    await init;
    psiTurk.doInstructions(
    	instructionPages, // a list of pages you want to display in sequence

    	//function() { currentview = new PaymentQuestionnaire(); } // what you want to do when you are done with instructions
        function() { currentview = new Demographics(); }
    );
});
/////////////////////////////////
// *  psiTurk 2 version * /////////
/*
$(window).on('load', async () => {
    await init;
    psiTurk.doInstructions(
    	instructionPages, // a list of pages you want to display in sequence
    	function() { currentview = new DemoQuestionnaire(); } // what you want to do when you are done with instructions
    );
});
*/
////////////////////////////////
