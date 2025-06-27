var server_host = "/";
var DATE_STRING = moment().format("YYYY-MM-DD");// Default today
var START_TIME  = 7;
var END_TIME    = 18;
var SPAN_TIME   = 0.25;// 0.5hours = 30 minutes
var list_events_by_resource = {};

$(document).ready(function() {
    $.ajax({
        url: server_host + "api/mstData?dt=2025-06-21",
        dataType: "json",
        success: function (json) {
            list_events_by_resource = {}
            drawResources_table(json.resources, json.events);
        }
    });
    
});

function drawResources_table(resources, events){
    var tablecontainer = $(".table-container");
    var table = $("<table>",{
        class:"table-hover"
    });
    // Draw head
    var table_thead = drawTHead(resources);
    table.append(table_thead);
    // Draw head
    var table_tbody = drawTableBody(resources, events);
    table.append(table_tbody);
    // Draw event to body
    // End draw
    tablecontainer.append(table);

    // Now draw event
    Object.keys(list_events_by_resource).forEach(function(resource) {
        list_events_by_resource[resource].forEach(e=>{
            // Check event time length
            var diff = (e.end - e.start)/3600;
            var rowspan = Math.round(diff * (1/SPAN_TIME));
            var td_resource = $("#"+e["restime_id"]);
            td_resource.hover(
                function() {
                    //  (mouseenter)
                    $(this).css("background-color", "bisque");
                },
                function() {
                    //  (mouseleave)
                    $(this).css("background-color", "white");
                }
            );
            var div_card = drawCardEvent(e);
            td_resource.attr('rowspan', rowspan );
            // Remove all cospan 
            var tmp = e["restime_id"].split("_");
            //console.log( "COLSPAN ="+tmp[2] );
            var column_id = parseInt( tmp[2] );
            for( i=1; i<rowspan; i++ ){
                //console.log( "COLSPAN = i="+i+" "+ '#'+tmp[0]+"_"+tmp[1]+"_"+(column_id + i*25) );
                $('#'+tmp[0]+"_"+tmp[1]+"_"+(column_id + i*25)).remove();
            }
            // Remove all cospan 

            td_resource.addClass("align-top" );
            td_resource.addClass("bg-info rounded-1" );
            td_resource.append(div_card);
        });
    });

    // $('table tr').each(function(){

    //     var indexofThis,indexofColSpan,numRows;
    //     if($('td[rowspan]',this).length!=0)
    //     {
    //         indexofThis =$('table tr').index(this);
    //         indexofColSpan = $('td',this).index($('td[rowspan]',this));
    //         numRows = $('td[rowspan]',this).attr('rowspan');

    //         $('table tr:gt('+indexofThis+')').each(function(){
    //             //$('td:eq('+indexofColSpan+')',this).remove();
    //         });
    //     }
    // });
}
function drawCardEvent(e){
    var div_card = $('<div>', {
        class: "card card-blue position-sticky",
        style: "margin-bottom: 0px"
    });
    var div_card_body = $('<div>', {
        class: "card-body p-0",
        //html: "<p>"+e.title+"</p>"
        html: '<div class="row align-items-center m-b-30">'+
                    '<div class="col">'+
                        '<p class="m-b-5 text-white">'+e.title+'</p>'+
                        '<p class="m-b-0 f-w-700 text-white">$15</p>'+
                    '</div>'+
                    //'<div class="col-auto">'+
                    //    '<i class="fas fa-database text-c-blue f-18"></i>'+
                    //'</div>'+
                '</div>'+
                '<p class="m-b-0 text-white">'+
                '<span class="label label-warning m-0">'+moment.unix(e.start).format("HH:mm")+'-'+
                moment.unix(e.end).format("HH:mm")+'</span><br>'+
                e.content + 
                '</p>'
    });
    div_card.append( div_card_body);
    return div_card;
}
function drawTHead(resources){
    var table_thead = $("<thead>");
    var table_thead_tr = $("<tr>");
    
    var thead_th0 = $("<th>", {
        text: "Technician All",
        class:"w-auto"
    });
    table_thead_tr.append(thead_th0);
    // Append resouce to thead
    resources.forEach(resource => {
        var thead_th_resource = $('<th>', {
            id: "res-"+resource.name,
            class:"w-auto"
        });
        var div_resource_head = build_resource_head_card(resource);
        //var div_resource_head = build_resource_head(resource);
        
        thead_th_resource.append(div_resource_head);
        table_thead_tr.append(thead_th_resource);
    });
    table_thead.append(table_thead_tr);
    return table_thead;
}
function drawTableBody(resources, events){
    var table_tbody = $("<tbody>");
    let _start_time = moment(DATE_STRING); // Creates a moment object for the current time
    _start_time.hour(START_TIME); // Sets the hour to 15 (3 PM)
    _start_time.minute(0); // Sets the hour to 15 (3 PM)

    // Find all event in same day
    let current_time_begin = moment(DATE_STRING);
    let current_time_end = moment(DATE_STRING);
    current_time_begin.hour(START_TIME)
    current_time_begin.minute(0)
    current_time_end.hour(END_TIME)
    current_time_end.minute(59)

    events.forEach((ev)=>{
        if( current_time_begin.isBefore(moment.unix(ev.start)) && 
            current_time_end.isAfter(moment.unix(ev.end))
        ){
            if( ev.resource in list_events_by_resource){
                
            }
            else{
                list_events_by_resource[ev.resource] = [];
            }
            list_events_by_resource[ev.resource].push(ev);
        }
    });
    // Sort dict
    Object.keys(list_events_by_resource).forEach(function(resource) {
        list_events_by_resource[resource].sort(function(a,b) {return (a.start > b.start) ? 1 : -1;});
    });
    console.log(list_events_by_resource);
    //
    var list_event_found = []
    for(i=START_TIME; i<=END_TIME; i+=SPAN_TIME){
        var table_tr = $("<tr>");
        table_tr.hover(
            function() {
                //  (mouseenter)
                //$(this).css("font-weight", "bold"); 
                $(this).css("background-color", "bisque");
            },
            function() {
                //  (mouseleave)
                //$(this).css("font-weight", "normal"); 
                $(this).css("background-color", "white");
            }
        );
        // Draw time line
        var column_td_time = $("<td>", {
            text: _start_time.format("hh:mm A"),
            id: "time_"+i,
            class: "cal-time",
        });
        column_td_time.hover(
            function() {
                //  (mouseenter)
                $(this).css("font-weight", "bold"); 
            },
            function() {
                //  (mouseleave)
                $(this).css("font-weight", "normal"); 
            }
        );
        column_td_time.click(function() {
            //console.log( "click time: " + $(this).attr("id"));
            // $(this).css("font-weight", "bold"); 
            //$(this).css("background-color", "burlywood");
        });
        table_tr.append(column_td_time);

        resources.forEach(resource => {
            var column_td_resource = $('<td>', {
                id: "restime_"+resource.name+"_"+(i*100),
                //text: "restime_"+resource.name+"_"+(i*100)
            });
            column_td_resource.hover(
                function() {
                    //  (mouseenter)
                    $('td[id*="restime_'+resource.name+'"]').each(function() {
                        $(this).css("background-color", "bisque");
                    });
                },
                function() {
                    //  (mouseleave)
                    $('td[id*="restime_'+resource.name+'"]').each(function() {
                        $(this).css("background-color", "");
                    });
                }
            );
            column_td_resource.click(function() {
                console.log( "click resource time: " + $(this).attr("id"));
                // $('td[id*="restime_'+resource.name+'"]').each(function() {
                //     $(this).css("background-color", "burlywood");
                //     console.log("Change bg ID burlywood:", $(this).attr('id'));
                // });
                
            });
            table_tr.append(column_td_resource);
            // add resource time line
            if( resource.name in list_events_by_resource){
                list_events_by_resource[resource.name].forEach(e=>{
                    // Check each event - check with time
                    var duration = moment.duration(_start_time.diff(moment.unix(e.start)));
                    var minutes = duration.asMinutes();
                    if( Math.abs(minutes) < 5){
                        e["restime_id"] = "restime_"+resource.name+"_"+(i*100);
                        var td_resource = $("#"+e["restime_id"]);
                    }
                });
                // draw resource 
            }
        });
        table_tbody.append(table_tr);
        _start_time.add(SPAN_TIME*60, 'minutes');
    }
    return table_tbody;
}

function build_resource_head_card(resource){
    var div_card = $('<div>', {
        class: "card proj-t-card card-green",
        style: "margin-bottom: 2px"
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