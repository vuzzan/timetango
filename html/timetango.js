var server_host = "/";
var template_path = server_host + "Template";
var DATE_STRING = moment().format("YYYY-MM-DD");// Default today
var START_TIME  = 7;
var END_TIME    = 18;
var SPAN_TIME_MIN   = 15;// 15 minutes
var SPAN_TIME   = 15/60;// 0.5hours = 30 minutes
var list_events_by_resource = {};
var SHOW_LINE_TIME = false;
var SHOW_LINE_RESOURCE = false;
DATE_STRING= "2025-06-21";

var dicResourceByName = {};
var dicEventById = {};

(function ($) { 
$.fn.insertAtIndex = function(index,selector){
    var opts = $.extend({
        index: 0,
        selector: '<div/>'
    }, {index: index, selector: selector});
    return this.each(function() {
        var p = $(this);  
        var i = ($.isNumeric(opts.index) ? parseInt(opts.index) : 0);
        if(i <= 0)
            p.prepend(opts.selector);
        else if( i > p.children().length-1 )
            p.append(opts.selector);
        else
            p.children().eq(i).before(opts.selector);       
    });
};  
})( jQuery );

$(document).ready(function() {
    $(".page-wrapper").css("padding", "0px 0px 0px 0px");
    $(".pcoded-inner-content").css("padding", "1px 1px 1px 1px");
    var token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    $.ajax({
        url: server_host + "api/me",
        dataType: "json",
        success: function (json) {
            drawUserProfile(json.user);
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
        error: function (xhr) {
            const error = xhr.responseJSON ? xhr.responseJSON.message : 'Error';
            if (xhr.status === 401) {
                // Token không hợp lệ, yêu cầu đăng nhập lại
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        },
    });

    
});

function drawResources_table(resources, events){
    if( !resources ){
        return;
    }
    resources.forEach(res=>{
        dicResourceByName[res.name] = res;
    });
    events.forEach(res=>{
        dicEventById[res.id] = res;
    });
    list_events_by_resource = {}
    
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
    //console.log(list_events_by_resource);
    // Now draw event
    Object.keys(list_events_by_resource).forEach(function(resource) {
        list_events_by_resource[resource].forEach(e=>{
            //console.log( e );
            if( "restime_id" in e ){
                // OK
            }
            else{
                return;
            }

            // Check event time length
            var diff = (e.end - e.start)/3600;
            var rowspan = Math.round(diff * (1/SPAN_TIME));
            var td_resource = $("#"+e["restime_id"]);
            td_resource.disableSelection();
            //td_resource.addClass("ui-sortable-handle");//
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
                //$('#'+tmp[0]+"_"+tmp[1]+"_"+(column_id + i*25)).remove();
                $('#'+tmp[0]+"_"+tmp[1]+"_"+(column_id + i*25)).hide();
            }
            // Remove all cospan 

            td_resource.addClass("align-top" );
            td_resource.addClass("bg-info rounded-1" );
            td_resource.append(div_card);
        });
    });
}
function drawCardEvent(e){
    var div_card = $('<div>', {
        class: "card card-green",
        style: "margin-bottom: 0px",
        event_id: e.id
    });
    
    div_card.click(function() {
        console.log("Click card event");
    });
    var lastFoundId = "";

    div_card.hover(
        function() {
            //  (mouseenter)
            $(this).removeClass("card-green");
            $(this).addClass("card-blue");
            $(this).removeClass("position-sticky");
            $(this).draggable({
                //autoScroll: true,
                //scrollSpeed: 4,
                //cursor: "move", 
                //cursorAt: { top: 56, left: 56 }, 
                containment: "#table_body_calendar",
                start: function(){
                    //console.log("Start move");
                },
                drag: function (event, ui) {
                    // Find the nearest element
                    var findId = findClosetTdElement(".table-container", this);
                    if( findId.length ){
                        if( lastFoundId.length>0 ){
                            $("#"+lastFoundId).css("background-color", "");    
                        }
                        $("#"+findId).css("background-color", "bisque");
                        lastFoundId = findId;
                    }
                },
                stop: function(){
                    // find the correct td
                    //console.log( $(this));
                    var findId = findClosetTdElement(".table-container", this);
                    
                    // Old ID
                    var old_td = $(this).parent();
                    var old_td_id = old_td.attr("id");
                    if( findId.length > 0 && findId!=old_td_id){
                        // Found position - add new
                        var rowspan = old_td.attr("rowspan");
                        $("#"+findId).attr("rowspan", rowspan);
                        $("#"+findId).html("");
                        $("#"+findId).css("background-color", "#ffffff");
                        $("#"+findId).addClass("align-top bg-info rounded-1");
                        $("#"+findId).append( $(this));
                        // Return back for the last move
                        old_td.attr("rowspan", "");
                        old_td.attr("class", "");
                        old_td.css("background-color", "");    
                        //
                        var tmp_new = findId.split("_");
                        var tmp_old = old_td_id.split("_");
                        var column_id_new = parseInt( tmp_new[2] );
                        var column_id_old = parseInt( tmp_old[2] );
                        for( i=1; i<rowspan; i++ ){
                            if( tmp_old[0]+"_"+tmp_old[1]+"_"+(column_id_old + i*25) != tmp_new[0]+"_"+tmp_new[1]+"_"+(column_id_new + i*25) ){
                                $('#'+tmp_old[0]+"_"+tmp_old[1]+"_"+(column_id_old + i*25)).show();
                                $('#'+tmp_new[0]+"_"+tmp_new[1]+"_"+(column_id_new + i*25)).hide();
                            }
                        }
                        // 
                        if( lastFoundId.length>0 ){
                            $("#"+lastFoundId).css("background-color", "");
                            updateCardEventData(this, {"new": tmp_new, "old": tmp_old });
                        }
                        //
                    }
                    $(this).css( "top", "");
                    $(this).css( "left", "");
                    $(this).addClass("position-sticky");
                }
            });
        },
        function() {
            //  (mouseleave)
            $(this).addClass("card-green");
            $(this).removeClass("card-blue");
            //$(this).draggable( "disable" )
        }
    );
    
    var div_card_body = $('<div>', {
        class: "card-body p-0",
        //style: "background-color: #dfdfdf",
        //html: "<p>"+e.title+"</p>"
        html: '<div class="row align-items-center">'+
                    '<div class="col">'+
                        '<p class="m-b-5 text-blue">'+e.title+'</p>'+
                        '<p class="m-b-5 text-white">'+
                            moment.unix(e.start).format("HH:mm")+'-'+
                            moment.unix(e.end).format("HH:mm")+'</p>'+
                    '</div>'+
                    //'<div class="col-auto">'+
                    //    '<i class="fas fa-database text-c-blue f-18"></i>'+
                    //'</div>'+
                '</div>'+
                '<p class="m-b-0 text-white">'+
                // '<span class="label label-warning m-0">'+moment.unix(e.start).format("HH:mm")+'-'+
                // moment.unix(e.end).format("HH:mm")+'</span><br>'+
                e.content + 
                '</p>'
    });
    // Double click to event
    div_card_body.dblclick(function() {
        $('#large-Modal').modal("show");
    });
    div_card_body.hover(
        function() {
            //  (mouseenter)
            //$(this).css("background-color", "bisque");
        },
        function() {
            //  (mouseleave)
            //$(this).css("background-color", "white");
        }
    );
    div_card.append( div_card_body);
    return div_card;
}
function drawTHead(resources){
    var table_thead = $("<thead>");
    var table_thead_tr = $("<tr>");
    
    var thead_th0 = $("<th>", {
        text: "All",
        //class:"w-auto"
    });
    table_thead_tr.append(thead_th0);
    // Append resouce to thead
    resources.forEach(resource => {
        var thead_th_resource = $('<th>', {
            id: "res-"+resource.name,
            //class:"w-auto"
        });
        var div_resource_head = build_resource_head_card(resource);
        
        thead_th_resource.append(div_resource_head);
        table_thead_tr.append(thead_th_resource);
    });
    table_thead.append(table_thead_tr);
    return table_thead;
}
function drawTableBody(resources, events){
    var table_tbody = $("<tbody>", {
        id: "table_body_calendar"
    });
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
    //console.log(list_events_by_resource);
    //
    var list_event_found = []
    for(i=START_TIME; i<=END_TIME; i+=SPAN_TIME){
        var table_tr = $("<tr>");
        if( SHOW_LINE_TIME==true ){
            table_tr.hover(
                function() {
                    //  (mouseenter)
                    $(this).css("background-color", "bisque");
                },
                function() {
                    //  (mouseleave)
                    $(this).css("background-color", "white");
                }
            );
        }
        // Draw time line
        var column_td_time = $("<td>", {
            //text: (i)%(1/SPAN_TIME)==0?_start_time.format("hh:mm A "):"",
            text: _start_time.format("hh:mm A "),
            id: "time_"+(i*100),
            class: "cal-time",
        });
        if( SHOW_LINE_TIME==true ){
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
        }
        
        column_td_time.dblclick(function() {
            //$('#large-Modal').modal("show");
            //$('#Modal-overflow').modal("show");
            //$('#modal-13').modal("show");
        });
        table_tr.append(column_td_time);

        resources.forEach(resource => {
            var column_td_resource = $('<td>', {
                id: "restime_"+resource.name+"_"+(i*100),
                //: ""+resource.name+"_"+(i*100)
            });
            column_td_resource.dblclick(function() {
                $('#large-Modal').modal("show");
                // $('#large-Modal').modal({
                //     show: true
                // });
            });
            if( SHOW_LINE_RESOURCE==true ){
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
            }
            column_td_resource.click(function() {
                console.log( "click resource time: " + $(this).attr("id"));
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
        class: "card prod-p-card card-yellow",
        style: "margin-bottom: 1px; "
    });
    div_card.hover(
        function() {
            //  (mouseenter)
            $(this).removeClass("card-yellow"); 
            $(this).addClass("card-blue"); 
        },
        function() {
            //  (mouseleave)
            $(this).addClass("card-yellow"); 
            $(this).removeClass("card-blue"); 
        }
    );
    var div_card_body = $('<div>', {
        class: "card-body bg-yellow",
        style: "padding: 5px 5px 0px 5px;"
    });
    div_card_body.hover(
        function() {
            //  (mouseenter)
            $(this).removeClass("bg-red"); 
            $(this).addClass("bg-yellow"); 
        },
        function() {
            //  (mouseleave)
            $(this).removeClass("bg-yellow"); 
            $(this).addClass("bg-red"); 
        }
    );
    
    var div_card_body_item1 = $('<div>', {
        class: "row",
    });
    var div_card_body_avatar = $('<div>', {
        class: "col-auto",
    });
    var avatar = $('<img>', {
        src: template_path+"/files/assets/images/avatar-"+resource.id+".jpg",
        class: "img-radius",
        style: "width: 50px; opacity:0.8"
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
                //+ "<h6 class=\"m-b-0 text-c-red\">"+resource.rate+"</h6>"
        });
    

    div_card_body_avatar.append(tech_name);

    div_card_body_item1.append(div_card_body_avatar);

    div_card_body.append(div_card_body_item1);
    div_card.append(div_card_body);

    return div_card;
}

function updateCardEventData(elEvent, newData){
    //console.log( newData );
    //console.log( $(elEvent));
    //console.log( $(elEvent).attr("event_id"));
    var event_id = $(elEvent).attr("event_id");
    var e = dicEventById[event_id];
    console.log( e );
    e.resource = newData["new"][1];
    // new time = 
    var timediff_minutes = parseInt( newData["new"][2])-parseInt( newData["old"][2]);
    //console.log( " timediff = " + timediff_minutes +" 100=" + (timediff_minutes/100) );
    timediff_minutes = 15*(parseFloat(timediff_minutes/100)/0.25);
    //console.log( " timediff = " + timediff_minutes +" 100=" + (timediff_minutes/100) );
    e.start += (timediff_minutes)*60;
    e.end += (timediff_minutes)*60;
    //restime_id: restime_Tony_850
    e.restime_id = "restime_" + newData["new"][1] + "_" + newData["new"][2];
    //console.log( e );
    //update time from time to
    $(elEvent).find("p").eq(1).html("<p>"+ moment.unix(e.start).format("HH:mm")+'-'+
                            moment.unix(e.end).format("HH:mm")+'</p>');

    var dataJson = JSON.stringify(e);
    console.log( dataJson );
    // Update event database
    $.ajax({
        url: server_host + "api/events",
        type: 'post',
        dataType: "json",
        data: dataJson,
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: function (json) {
            console.log(json);
        },
        headers: {
            Authorization: "Bearer "+ localStorage.getItem('token'),
        },
        error: function (xhr) {
            const error = xhr.responseJSON ? xhr.responseJSON.message : 'Error';
            if (xhr.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        },
        
    });
}

function findClosetTdElement(scrollParent, myElelemt){
    var findId = "";
    //console.log( $(scrollParent).scrollLeft() );
    var scrollLeft = $(scrollParent).scrollLeft()
    var scrollTop = $(scrollParent).scrollTop()
    var pos = $(myElelemt).position();
    //console.log( pos );
    //console.log( $(myElelemt) );
    var mintop=100000;
    $('td[id*="restime_"]').each(function(i, el) {
        var a =  parseInt($(el).position().top) - (parseInt(pos.top) + scrollTop);
        var b = parseInt($(el).position().left) - (parseInt(pos.left) + scrollLeft);
        let value = Math.sqrt(a*a + b*b);
        if( mintop >  value ){
            mintop = value;
            findId = $(this).attr("id");
            //console.log( findId);
        }
    });
    //console.log( "return findClosetTdElement=" + findId);
    return findId;
}

function drawUserProfile(user){
    // Avatar
    $("#id_profile").find("img").attr("src", "/Template/files/assets/images/avatar-"+user.id+".jpg");
    // Name
    $("#id_profile").find("span").html(user.name);
}
function logout(){
    $.ajax({
        url: server_host + "api/logout",
        type: 'post',
        dataType: "json",
        data: {},
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: function (json) {
        },
        headers: {
            Authorization: "Bearer "+ localStorage.getItem('token'),
        }
    });
    localStorage.removeItem('token');
    window.location.href = '/login';
}

// 