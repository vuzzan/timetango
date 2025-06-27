var server_host = "/";
var DATE_STRING = moment().format("YYYY-MM-DD");// Default today
var START_TIME  = 7;
var END_TIME  = 18;
var SPAN_TIME  =0.25;// 0.5hours = 30 minutes

$(document).ready(function() {
    //drawTimeline();
    $.ajax({
        url: server_host + "api/events",
        dataType: "json",
        success: function (json) {
            drawResources_div(json.resources, json.events);
            //console.log(json.events);
        }
    });
    
});
function drawTimeline(){
    var timeline = $(".calendar-time");
    //var start = 9, end = 18, span=0.5;
    let _start_time = moment(DATE_STRING); // Creates a moment object for the current time
    _start_time.hour(START_TIME); // Sets the hour to 15 (3 PM)
    _start_time.minute(0); // Sets the hour to 15 (3 PM)

    for(i=START_TIME; i<=END_TIME; i+=SPAN_TIME){
        //console.log("drawTimeline" + start_time.format("hh mm A"));
        var time_span = $("<li>", {
            text: _start_time.format("hh mm A")
        });
        time_span.click(function(){
            // alert("Click me " + $( this ).html());
        });
        time_span.hover(
            function() {
                //  (mouseenter)
                $(this).css("font-weight", "bold"); 
                $(this).css("background-color", "bisque");
            },
            function() {
                //  (mouseleave)
                $(this).css("font-weight", "normal"); 
                $(this).css("background-color", "white");
            }
        );
        timeline.append(time_span);
        _start_time.add(SPAN_TIME*60, 'minutes');
    }
}

function drawResources_div(resources, events){
    var div_resource = $(".calendar-resource-list").addClass("row flex-nowrap overflow-auto");
    resources.forEach(resource => {
        var div_col = $('<div>', {
            class: "col-xl col-md"
        });
        var div_ul = $('<ul>', {
            class: "calendar-resource"
        });
        // Build resource header and list event
        var div_li = $('<li>');
        var div_resource_head = build_resource_head(resource);
        div_li.append(div_resource_head);
        // End resource head
        div_ul.append(div_li);
        div_col.append(div_ul);
        div_resource.append(div_col);
    });
}

function drawResources_ul(resources, events){
    //
    var div_resource = $(".calendar-resource-list");
    resources.forEach(resource => {
        var div_col = $('<div>', {
            class: "col-xl col-md"
        });
        var div_ul = $('<ul>', {
            class: "calendar-resource"
        });
        // Build resource header and list event
        var div_li = $('<li>');
        var div_resource_head = build_resource_head(resource);
        div_li.append(div_resource_head);
        //var div_resource_event  = build_resource_with_events(resource, events);
        //div_li.append(div_resource_event);
        // End resource head
        div_ul.append(div_li);
        div_col.append(div_ul);
        div_resource.append(div_col);
    });
}

function build_resource_with_events(resource, events){
    // var DATE_STRING = moment().format("YYYY-MM-DD");// Default today
    // var START_TIME  = 7;
    // var END_TIME  = 18;
    // var SPAN_TIME  =0.5;
    let current_time_begin = moment(DATE_STRING);
    let current_time_end = moment(DATE_STRING);
    current_time_begin.hour(START_TIME)
    current_time_begin.minute(0)
    current_time_end.hour(END_TIME)
    current_time_end.minute(59)

    var list_events = [];
    events.forEach((ev)=>{
        if( ev.resource==resource.name ){
            if( current_time_begin.isBefore(moment.unix(ev.start)) && 
                current_time_end.isAfter(moment.unix(ev.end))
            ){
                //console.log( moment.unix(ev.start).format("YYYY-MM-DD HH:mm:ss") +" to "+ moment.unix(ev.end).format("YYYY-MM-DD HH:mm:ss")  );
                //console.log();
                list_events.push(ev);
            }
        }
    });
    //console.log( list_events );
    list_events.sort(function(a,b) {return (a.start > b.start) ? 1 : -1;});
    // Build list
    var div_ul = $('<ul>');

    var div_root_event = $('<div>');
    list_events.forEach(ev=>{
        let hoursDifference = current_time_begin.diff(moment.unix(ev.start), 'hours');
        let hoursDifference_end = current_time_begin.diff(moment.unix(ev.end), 'hours');
        console.log( hoursDifference );

        var style_str = "top: "+ ((-hoursDifference)*80+30)+"px;"
                +"height: "+ ((hoursDifference-hoursDifference_end)*80)+"px;"


        var div_card = $('<div>', {
            class: "card prod-p-card card-blue m-0",
            style: style_str
        });

        var div_card_body = $('<div>', {
            class: "card-body p-0",
            html: '<p class="m-b-0 text-white">'+   
                    '<span class="label label-warning m-0">'+moment.unix(ev.start).format("HH:mm")+'-'+
                    moment.unix(ev.end).format("HH:mm")+'</span><br>'+
                    ((-hoursDifference)*80+30)+
                    '</p>'
        });
        div_card.append( div_card_body);

        div_root_event.append( div_card );
    });

    div_ul.append( $('<li>').append(div_root_event) );
    return div_ul;
}

function build_resource_head(resource){
    var div_card = $('<div>', {
        class: "card proj-t-card card-green"
    });
    div_card.hover(
            function() {
                //  (mouseenter)
                $(this).removeClass("card-green"); 
                $(this).addClass("card-yellow"); 
            },
            function() {
                //  (mouseleave)
                $(this).removeClass("card-yellow"); 
                $(this).addClass("card-green"); 
            }
        );

    var div_card_body = $('<div>', {
        class: "card-body"
    });

    var div_card_body_item1 = $('<div>', {
        class: "row align-items-center m-b-30",
    });
    var div_card_body_avatar = $('<div>', {
        class: "col-auto",
    });
    var avatar = $('<img>', {
            src: "../files/assets/images/avatar-"+resource.id+".jpg",
            class: "img-radius",
            style: "width: 40px; opacity:0.7"
        });
    avatar.hover(
            function() {
                //  (mouseenter)
                $(this).css("opacity", "1"); 
                $(this).css("transition", "opacity 1s");
            },
            function() {
                //  (mouseleave)
                $(this).css("opacity", "0.7");
            }
        );
    div_card_body_avatar.append(avatar);

    var tech_name = $('<div>', {
            class: "col p-l-0",
            html: "<h6 class=\"m-b-5\">"+resource.name+"</h6>" 
                + "<h6 class=\"m-b-0 text-c-red\">"+resource.rate+"</h6>"
        });
    

    div_card_body_avatar.append(tech_name);

    div_card_body_item1.append(div_card_body_avatar);

    div_card_body.append(div_card_body_item1);
    div_card.append(div_card_body);

    return div_card;
}