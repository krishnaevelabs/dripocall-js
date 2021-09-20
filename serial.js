// bugs noticed 
// other serial prints might cause issues, filter out them before doing any actions.

/*
Function Tree

--Async Req Port 
  --Connect Serial
    --routetoDevice (identify type of device)
      --StateUpdateDevice (Identify states from message)
        --DeviceStates (populateStates)
*/

//<V1>B894857495549162611-V1-C/D/A/blue-B101-1-71

var dripos = [{
    "id": "D222949140",
    "name": "D1"
  },
  {
    "id": "D222949141",
    "name": "D2"
  },
  {
    "id": "D222949142",
    "name": "D3"
  },
]


function populateDripos() {
  dripos.forEach(iterateDripo);

  function iterateDripo(item) {
    var html = $("#dripoStatusTemplate").html();
    html = $.parseHTML(html)
    $.each(html, function(i, el) {
      if (el.id == "dripoRoot")
        el.classList.add(item.id);
    });
    $("#dripoStatus").append(html);
    //baseStateDripo(item.id);
    $("." + item.id + " .rate").html(item.name);
  $("." + item.id + " .unit").html("Offline");
  $("." + item.id + " .bed").html("");
  $("." + item.id + " .time").html(item.id);
  $("." + item.id + " .volume").html("");
  $("." + item.id + " .volStatusBar").css('width', "0px");
  $("." + item.id + " .volCard").css('display', "none");
  $("." + item.id + " .volStatusBar").removeClass("blink_me");
  $("." + item.id + " .volStatusBar").css('display', "none");
  $("." + item.id + " .action").css("display", "none");
  }

}

populateDripos();

var ws = new WebSocket("ws://127.0.0.1:5678/")
ws.onmessage = function (event) {
routeToDeviceFn(event.data);
console.log(event.data)
};

function routeToDeviceFn(value) {
  const dataArr = value.split("-");
  //console.log(dataArr);
  if (dataArr.length > 1) {
    var device = dataArr[0].split(">");
    if (device.length > 1) {
      var devType = device[1].substr(0, 1)
      var devID=device[1];
    } else {
      var devType = device[0].substr(0, 1)
      var devID=device[0];
    }
    if (devType == 'D') {
     // console.log("dripo")
     dripo = dripos.find(dripo => dripo.id === devID);
     if(dripo.name)
      stateUpdateDripo(dataArr);
    } else if (devType == 'B') {
      updateNurseCall(dataArr);
    }
  }
}


function stateUpdateDripo(message) {

  /* states
             -- baseStateDripo
             -- onStateDripo
             -- monitoringStateDripo
             -- medAlertStateDripo
             -- highAlertStateDripo
    Serial Msg types
            -- ACK - DID-ACK len=2
            -- ON/OFF - DID-V2-ON len=3
            -- STATUSMSH - DID------- Len=12
  */

  //get Device ID Split <>
  var deviceid = message[0].split(">");
  var deviceid = deviceid[1];
  //discard ack msg ny using condition len>2
  if (message.length > 3) {
          //Assiging Values
            console.log(message);
            baserRate = message[7];
            dpf = message[5];
            unit = unit_convert(message[4]);
            function unit_convert(num) {
              if (num == 1)
                return "dpm"
              else
                return "ml/hr"
            }
            if (unit == 'dpm')
              rate = message[6] / 60 * dpf;
            else
            rate = message[6];
            status = message[2];
            bed = message[3];
            infusedVol = message[8];
            totalVol = message[9];
            battery = message[10];
            volPercentage = Math.ceil(infusedVol / totalVol * 100);
            timeRemaining = totalVol / rate * 60;
            function time_convert(num) {
              var hours = Math.floor(num / 60);
              var minutes = Math.ceil(num % 60);
              return "<b>" + hours + "h " + minutes + "mts</b> remaining";
            }
            timeRemainingText = time_convert(timeRemaining)

    //routing to stateFunctions
    if (status == "I") {
      monitoringStateDripo(deviceid)
    } else if (status == "B") {
      $("." + deviceid + " .rate").html("Flow Error");
      highAlertStateDripo(deviceid);
    } else if (status  == "P") {
      $("." + deviceid + " .rate").html("Infusion Paused");
      medAlertStateDripo(deviceid);
    } else if (status  == "C") {
      $("." + deviceid + " .rate").html("Infusion Ending Soon");
      highAlertStateDripo(deviceid);
    } else if (status  == "E") {
      $("." + deviceid + " .rate").html("Infusion Ended");
      highAlertStateDripo(deviceid);
    } else if (status  == "X") {
      baseStateDripo(deviceid);
  }
}
}

function monitoringStateDripo(deviceid) {
  resetAlertDripo(deviceid);
  if (baserRate == 0)
    $("." + deviceid + " .rate").html(rate);
  else
    $("." + deviceid + " .rate").html(rate + "/" + baserRate);
  $("." + deviceid + " .unit").html(unit);
  $("." + deviceid + " .bed").html(bed);
  $("." + deviceid + " .time").html(timeRemainingText);
  $("." + deviceid + " .volume").html("<b>" + infusedVol + "/" + totalVol + "ml</b> Infused");
  $("." + deviceid + " .battery").html(battery + "% remaining");
  $("." + deviceid + " .volStatusBar").css('width', volPercentage + "%");
  $("." + deviceid + " .volCard").css('display', "block");
  $("." + deviceid + " .volStatusBar").css('display', "block");
  $("." + deviceid + " .volStatusBar").removeClass("blink_me");
  $("." + deviceid + " .action").css("display", "none");
  $("." + deviceid + " .volCard").css('display', "block");
}

function baseStateDripo(deviceid) {
  resetAlertDripo(deviceid);
  dripo = dripos.find(dripo => dripo.id === deviceid);
  //console.log(dripo);
  $("." + deviceid + " .rate").html(dripo.name);
  $("." + deviceid + " .unit").html("Offline");
  $("." + deviceid + " .bed").html("");
  $("." + deviceid + " .time").html(deviceid);
  $("." + deviceid + " .volume").html("");
  $("." + deviceid + " .volStatusBar").css('width', "0px");
  $("." + deviceid + " .volCard").css('display', "none");
  $("." + deviceid + " .volStatusBar").removeClass("blink_me");
  $("." + deviceid + " .volStatusBar").css('display', "none");
  $("." + deviceid + " .action").css("display", "none");
}

function highAlertStateDripo(deviceid) {
  $("." + deviceid + " .unit").html(unit);
  $("." + deviceid + " .bed").html(bed);
  $("." + deviceid + " .time").html(timeRemainingText);
  $("." + deviceid + " .volume").html("<b>" + infusedVol + "/" + totalVol + "ml</b> Infused");
  $("." + deviceid + " .battery").html(battery + "% remaining");
  $("." + deviceid + " .rate").css("color", "#EB5757");
  $("." + deviceid + " .action").css("display", "block");
  $("." + deviceid + " .volStatusBar").css("background-color", "#EB5757");
  $("." + deviceid + " .volStatusBar").addClass("blink_me");
  $("." + deviceid + " .volCard").css('display', "block");
}

function medAlertStateDripo(deviceid) {
  $("." + deviceid + " .unit").html(unit);
  $("." + deviceid + " .bed").html(bed);
  $("." + deviceid + " .time").html(timeRemainingText);
  $("." + deviceid + " .volume").html("<b>" + infusedVol + "/" + totalVol + "ml</b> Infused");
  $("." + deviceid + " .battery").html(battery + "% remaining");
  $("." + deviceid + " .action").css("display", "none");
  $("." + deviceid + " .rate").css("color", "#F2C94C");
  $("." + deviceid + " .volStatusBar").css("background-color", "#F2C94C");
  $("." + deviceid + " .volStatusBar").addClass("blink_me");
  $("." + deviceid + " .volCard").css('display', "block");
}


// helper functions for states dripo

function resetAlertDripo(deviceid) {
  $("." + deviceid + " .rate").css("color", "#6D7587");
  $("." + deviceid + " .volStatusBar").css("background-color", "#6202EE");
}


function updateNurseCall(message) {
  //$("#dripoStatus").html($("#dripoStatusTemplate").html());

let calldeviceid = message[0].split(">");
calldeviceid = calldeviceid[1];
let callStatus=message[2];

if(callStatus=="C"){
console.log("Call");
//writeSerial(calldeviceid+"-ACKt");
}else if(callStatus=="D"){
console.log("Cancel");
}else if(callStatus=="A"){
console.log("Acknowledge");
}
}


