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
    "demographics.html",
    "check_question.html",
    "anthropomorphismSliders.html",
    "likabilitySliders.html",
    "moralStatus.html",
    "pronounCheck.html",
    "videoTest.html"
];

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
 * Pre-Experiment Information *
 ***********************/
var PreExperimentQuestionnaire = function() {

    psiTurk.finishInstructions();
    
    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {
        console.log("condition", mycondition);
        psiTurk.recordUnstructuredData("condition", mycondition);

        psiTurk.recordTrialData({'phase':'pre-experiment_questionnaire', 'status':'submit'});

        $('input[name=age]').each( function(i, val) {
            console.log(this.id, this.value);
            psiTurk.recordUnstructuredData(this.id, this.value);
        });

        var radio_groups = {}

        $(":radio").each(function(i, val){
            radio_groups[this.name] = true;
        });
        for(group in radio_groups){
            console.log(group,$(":radio[name='"+group+"']:checked").val());
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
    psiTurk.recordTrialData({'phase':'pre-experiment_questionnaire', 'status':'begin'});

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


/******************
 *     Video      *
 ******************/
var Video = function() {
    psiTurk.finishInstructions();

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    var ppcounter = 0;
    var rscounter = 0;

    record_responses = function() {
        psiTurk.recordTrialData({'phase':'experiment_video', 'status':'submit'});
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
    psiTurk.recordTrialData({'phase':'experiment_video', 'status':'begin'});

    //TODO
    //console.log("mycondition:  " + mycondition);
    if (mycondition % 10 == 0) {
        $("#mp4src").attr("src", "/static/videos/mp4_videos/masculine_null.mp4")
        $("#oggsrc").attr("src", "/static/videos/ogg_videos/masculine_null.ogg")
    }
    else if (mycondition % 10 == 1) {
        $("#mp4src").attr("src", "/static/videos/mp4_videos/feminine_null.mp4")
        $("#oggsrc").attr("src", "/static/videos/ogg_videos/feminine_null.ogg")
    }
    else if (mycondition % 10 == 2) {
        $("#mp4src").attr("src", "/static/videos/mp4_videos/masculine_they_them.mp4")
        $("#oggsrc").attr("src", "/static/videos/ogg_videos/masculine_they_them.ogg")
    }
    else if (mycondition % 10 == 3) {
        $("#mp4src").attr("src", "/static/videos/mp4_videos/feminine_they_them.mp4")
        $("#oggsrc").attr("src", "/static/videos/ogg_videos/feminine_they_them.ogg")
    }
    else if (mycondition % 10 == 4) {
        $("#mp4src").attr("src", "/static/videos/mp4_videos/masculine_it_its.mp4")
        $("#oggsrc").attr("src", "/static/videos/ogg_videos/masculine_it_its.ogg")
    }
    else if (mycondition % 10 == 5) {
        $("#mp4src").attr("src", "/static/videos/mp4_videos/feminine_it_its.mp4")
        $("#oggsrc").attr("src", "/static/videos/ogg_videos/feminine_it_its.ogg")
    }
    else if (mycondition % 10 == 6) {
        $("#mp4src").attr("src", "/static/videos/mp4_videos/masculine_he_him.mp4")
        $("#oggsrc").attr("src", "/static/videos/ogg_videos/masculine_he_him.ogg")
    }
    else if (mycondition % 10 == 7) {
        $("#mp4src").attr("src", "/static/videos/mp4_videos/feminine_he_him.mp4")
        $("#oggsrc").attr("src", "/static/videos/ogg_videos/feminine_he_him.ogg")
    }
    else if (mycondition % 10 == 8) {
        $("#mp4src").attr("src", "/static/videos/mp4_videos/masculine_she_her.mp4")
        $("#oggsrc").attr("src", "/static/videos/ogg_videos/masculine_she_her.ogg")
    }
    else if (mycondition % 10 == 9) {
        $("#mp4src").attr("src", "/static/videos/mp4_videos/feminine_she_her.mp4")
        $("#oggsrc").attr("src", "/static/videos/ogg_videos/feminine_she_her.ogg")
    }

    $("#video2").load();

    $("#video2").on('ended', function() {
        psiTurk.recordTrialData({'phase':'experiment_video', 'status':'video ended'});
        $('#next').removeAttr('disabled');
    });

    $("#ppbutton").click(function () {
        psiTurk.recordTrialData({'phase':'experiment_video', 'status':'play/pause clicked: '+ppcounter});
        ppcounter += 1;
    });

    $("#rsbutton").click(function () {
        psiTurk.recordTrialData({'phase':'experiment_video', 'status':'restart clicked: '+rscounter});
        rscounter += 1;
    });

    $("#next").click(function () {
        record_responses();
        currentview = new Anthropomorphism();
    });
};

/*********************************
 * Anthropomorphism *
 *********************************/

 var Anthropomorphism = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {
        psiTurk.recordTrialData({'phase':'anthropomorphism', 'status':'submit'});
        for(i=1; i<=5; i++){
	        var variable = document.getElementById(i);
            console.log("anthropomorphism_"+(i),$("input[name='"+i+"']").val());
    	    psiTurk.recordUnstructuredData("anthropomorphism_"+(i),$("input[name='"+i+"']").val());

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
    psiTurk.showPage('anthropomorphismSliders.html');

    function hasClass(element, cls) {
        // console.log(element)
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    function checkenable(){
        allclicked=true;

        for(i=1; i<=5; i++) {
            var slider = document.getElementById(i);
            if(hasClass(slider, "not-clicked")) {
                allclicked = false;
            }
        }

        if(allclicked){
	        $('#next').removeAttr('disabled');
        } else {
	        $('#next').attr('disabled', 'disabled');
	    }
    }


    $(".not-clicked").click(function(e){
	    $(this).removeClass('not-clicked');
	    $(this).addClass('clicked');
        checkenable();
    });

    $(".check").click(function(e){
	    checkenable();
    });

    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'anthropomorphism', 'status':'begin'});

    $("#next").click(function () {
        record_responses();
	    currentview = new Likeability();
    })
};

/*********************************
 * Likeability *
 *********************************/

 var Likeability = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {
        psiTurk.recordTrialData({'phase':'likeability', 'status':'submit'});
        for(i=1; i<=5; i++){
	        var variable = document.getElementById(i);
            console.log("likeability_"+(i),$("input[name='"+i+"']").val())
    	    psiTurk.recordUnstructuredData("likeability_"+(i),$("input[name='"+i+"']").val());

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
    psiTurk.showPage('likabilitySliders.html');

    function hasClass(element, cls) {
        // console.log(element)
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    function checkenable(){
        allclicked=true;

        for(i=1; i<=5; i++) {
            var slider = document.getElementById(i);
            if(hasClass(slider, "not-clicked")) {
                allclicked = false;
            }
        }

        if(allclicked){
	        $('#next').removeAttr('disabled');
        } else {
	        $('#next').attr('disabled', 'disabled');
	    }
    }


    $(".not-clicked").click(function(e){
	    $(this).removeClass('not-clicked');
	    $(this).addClass('clicked');
        checkenable();
    });

    $(".check").click(function(e){
	    checkenable();
    });

    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'likeability', 'status':'begin'});

    $("#next").click(function () {
        record_responses();
	    currentview = new MoralStatus();
    })
};

/*********************************
 * Moral Status *
 *********************************/

 var MoralStatus = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {
        psiTurk.recordTrialData({'phase':'moral_status', 'status':'submit'});
        for(i=1; i<=2; i++){
	        var variable = document.getElementById(i);
            console.log("moral_status_"+(i),$("input[name='"+i+"']").val());
    	    psiTurk.recordUnstructuredData("moral_status_"+(i),$("input[name='"+i+"']").val());

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
    psiTurk.showPage('moralStatus.html');

    function hasClass(element, cls) {
        // console.log(element)
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    function checkenable(){
        allclicked=true;

        for(i=1; i<=2; i++) {
            var slider = document.getElementById(i);
            if(hasClass(slider, "not-clicked")) {
                allclicked = false;
            }
        }

        if(allclicked){
	        $('#next').removeAttr('disabled');
        } else {
	        $('#next').attr('disabled', 'disabled');
	    }
    }


    $(".not-clicked").click(function(e){
	    $(this).removeClass('not-clicked');
	    $(this).addClass('clicked');
        checkenable();
    });

    $(".check").click(function(e){
	    checkenable();
    });

    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'moral_status', 'status':'begin'});

    $("#next").click(function () {
        record_responses();
	    currentview = new PronounCheck();
    })
};

/*********************************
 * Pronoun Check *
 *********************************/


var PronounCheck = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {

        // CHANGE
        psiTurk.recordTrialData({'phase':'pronoun_check', 'status':'submit'});

        var radio_groups = {}
        $(":radio").each(function(i, val){
            radio_groups[this.name] = true;
        })

        for(group in radio_groups){
            console.log("Recording: "+group+" "+$(":radio[name='"+group+"']:checked").val());
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
    psiTurk.showPage('pronounCheck.html');

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
    psiTurk.recordTrialData({'phase':'pronoun_check', 'status':'begin'});


    $("#next").click(function () {
        record_responses();
        currentview = new AttentionCheck();
    });

};

/*******************
 * Check_Question   *
 *******************/
var AttentionCheck = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {

        // CHANGE
        psiTurk.recordTrialData({'phase':'attention_check', 'status':'submit'});

        var radio_groups = {}
        $(":radio").each(function(i, val){
            radio_groups[this.name] = true;
        })

        for(group in radio_groups){
            console.log("Recording: "+group+" "+$(":radio[name='"+group+"']:checked").val());
            psiTurk.recordUnstructuredData(group,$(":radio[name='"+group+"']:checked").val());
        }

        // i is the number of slider questions
        for(i=1; i<=1; i++){
	        var variable = document.getElementById(i);
            console.log("Recording: speech_clarity " + $("input[name='"+i+"']").val());
    	    psiTurk.recordUnstructuredData("speech_clarity",$("input[name='"+i+"']").val());

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

    function checkenable(){
        slider_clicked=true;
        radio_clicked=true;

        for(i=1; i<=1; i++) {
            var slider = document.getElementById(i);
            if(hasClass(slider, "not-clicked")) {
                slider_clicked = false;
                //console.log("slider " + i + " not clicked");
            }
        }

        if ($('input[type=radio]:checked').size() > 0) {
            radio_clicked = true;
        } else {
            radio_clicked = false;
        }

        if(slider_clicked && radio_clicked){
	        $('#next').removeAttr('disabled');
        } else {
	        $('#next').attr('disabled', 'disabled');
	    }
    }

    $(".not-clicked").click(function(e){
	    $(this).removeClass('not-clicked');
	    $(this).addClass('clicked');
        checkenable();
    });

    $(":radio").change(function(e){
	    checkenable();
    });

    window.scrollTo(0, 0);
    // CHANGE
    psiTurk.recordTrialData({'phase':'attention_check', 'status':'begin'});


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
            console.log("Recording: "+group+" "+$(":radio[name='"+group+"']:checked").val());
            psiTurk.recordUnstructuredData(group,$(":radio[name='"+group+"']:checked").val());
        }
            
        $('input[name=other_gender_text]').each( function(i, val) {
            console.log("Recording: "+ this.name, this.value);
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
        // psiTurk.saveData({
        //     success: function() {
        //         clearInterval(reprompt);                
        //     }, 
        //     error: prompt_resubmit
        // });
    };

    
    // Load the questionnaire snippet 
    psiTurk.showPage('demographics.html');
        
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
        function() { currentview = new PreExperimentQuestionnaire(); }
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
