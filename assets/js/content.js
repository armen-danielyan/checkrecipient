var gmail = null,
    recipientList = [],
    logid = 0;
gMailManager = {

    eventInitialized: false,

    entityId: "",

    addModalFrame: function () {

        if ($(".modal-dialog").length > 0)
            return;

        if (gmail === null) {
            gmail = new Gmail($);

            gmail.observe.on("send_message", function (url, body, data, xhr) {
                console.log("url:", url, 'body', body, 'email_data', data, 'xhr', xhr);
            });
        }

        var self = this,
            $body = $("body"),
            $modal = $("<div/>", {
                class: "modal fade",
                id: "check-recipient-xt-modal",
                role: "dialog"
            }),
            $sendButton = $(".T-I.J-J5-Ji.aoO.T-I-atl.L3"),
            $modalDialog = $("<div/>", {class: "modal-dialog"}),
            $modalContent = $("<div/>", {class: "modal-content"}),
            $modalHeader = $("<div/>", {class: "modal-header"}).append(
                $("<button/>", {
                    type: "button",
                    class: "close",
                    "data-dismiss": "modal",
                    "aria-label": "Close"
                }).append($('<span aria-hidden="true">&times;</span>')),
                $("<h4/>", {
                    class: "modal-title",
                    id: "modal-title"
                }).text("Check recipient")
            ),
            $modalBody = $("<div/>", {class: "modal-body"}),

            $modalResponseMessage = $("<div/>", {
                id: "check-recipient-message"
            }),
            $modalResponseMessageMore = $("<div/>", {
                id: "check-recipient-message-more",
                style: "display:none"
            }),
            $modalToggle = $("<a/>", {
                id: "check-recipient-toggle"
            }).text("Click here to learn why CheckRecipient has flagged this email"),

            $modalFooter = $("<div/>", {class: "modal-footer"}),
            $modalBackButton = $("<button/>", {
                "data-dismiss": "modal",
                id: "modal-dismiss",
                style: "display:none"
            }),
            $modalNoButton = $("<button/>", {
                class: "btn btn-default",
                id: "modal-no"
            }).text("No"),
            $modalSendButton = $("<button/>", {
                class: "btn btn-primary",
                id: "modal-send"
            }).text("Send").prop("disabled", true);

        $("<div/>", {class: "form-group"}).append($modalResponseMessage).appendTo($modalBody);
        $("<div/>", {class: "form-group"}).append($modalResponseMessageMore).appendTo($modalBody);
        $("<div/>", {class: "form-group"}).append($modalToggle).appendTo($modalBody);

        $modalFooter.append($modalBackButton, $modalNoButton, $modalSendButton);
        $modalContent.append($modalHeader, $modalBody, $modalFooter).appendTo($modalDialog);
        $modal.append($modalDialog).appendTo($body);

        $modalSendButton.click(function () {
            respond("yes");
            $sendButton.click();
            $modalBackButton.click();
        });

        $modalNoButton.click(function () {
            respond("no");
            $modalBackButton.click();
        });

        function respond(sendorno){
            var jsonObj = {
                action: "user_response",
                username: "tom@quiversoftware.com",
                rb_username: "",
                user_domain: "checkrecipient.com",
                api_token: "b1b6f6938c96e3be0e42de3d61777015",
                product: "ai",
                log_id: logid,
                response: sendorno,
                yes_and_add_response: "",
                version: "1.5.1.0"
            };
            var jsonStr = JSON.stringify(jsonObj);

            $.ajax({
                dataType: "json",
                type: "POST",
                data: jsonStr,
                contentType: "application/json",
                url: "https://quiverlive.getcheckrecipient.com/api_external/user_response",
                success: function (data) {
                    console.log(data);
                },
                error: function () {
                    console.log("ERROR");
                }
            });
        }
    },

    displayApiResponse: function (data) {
        $("#check-recipient-xt-modal #modal-send").prop("disabled", false);
        $("#check-recipient-xt-modal #check-recipient-title").val(data.title);
    },

    addSendButtonEventHandler: function () {
        var self = this,
            $sendButton = $(".T-I.J-J5-Ji.aoO.T-I-atl.L3"),
            $messageForm = $("div.AD table form"),
            $newSendButton = $("<div/>", {
                class: "T-I J-J5-Ji aoO T-I-atl L3",
                role: "button",
                "data-tooltip": "Send ‪(Ctrl-Enter)‬",
                "aria-label": "Send ‪(Ctrl-Enter)‬",
                "data-tooltip-delay": 800
            }).css({
                "-webkit-user-select": "none"
            }).text("Send");

        self.addModalFrame();

        if (!self.eventInitialized) {
            self.eventInitialized = true;
            $sendButton.hide();
            $newSendButton.appendTo($sendButton.parent());
            $newSendButton.click(function () {

                var $parentTable = $(this).parents("table.aoP.aoC"),
                    $email = $($parentTable.find("form table.GS div.vR div.vT")[0]),
                    $subject = $parentTable.find("form div.aoD.az6 input[name='subjectbox']"),
                    email = ($email) ? $email.text() : "",
                    subject = $subject.val();

                $("#check-recipient-xt-modal #check-recipient-address").val(email);
                $("#check-recipient-xt-modal #check-recipient-subject").val(subject);
                $("#check-recipient-xt-modal").modal();
                $("#check-recipient-xt-modal #modal-send").prop("disabled", true);

                var jsonData = jsonBuilder(recipientList);
                $.ajax({
                    dataType: "json",
                    type: "POST",
                    data: jsonData,
                    contentType: "application/json",
                    url: "https://quiverlive.getcheckrecipient.com/api_external/check_email",
                    success: function (data) {
                        console.log(data);

                        logid = data["log_id"];

                        var message = data["message"],
                        more = data["more_detail"];
                        if (message == "") {
                            message = "No Message";
                        }
                        if (more == "") {
                            more = "No More Details";
                        }

                        $("#check-recipient-xt-modal #check-recipient-message").text(message);
                        $("#check-recipient-xt-modal #check-recipient-message-more").text(more);
                    },
                    error: function () {
                        console.log("ERROR");
                    }
                });

                var toggled = false;
                $("a#check-recipient-toggle").on("click", function(){
                    if(toggled) {
                        toggled = false;
                        $("div#check-recipient-message").css("display", "block");
                        $("div#check-recipient-message-more").css("display", "none");
                        $("a#check-recipient-toggle").text("Click here to learn why CheckRecipient has flagged this email");
                    } else {
                        toggled = true;
                        $("div#check-recipient-message").css("display", "none");
                        $("div#check-recipient-message-more").css("display", "block");
                        $("a#check-recipient-toggle").text("Return");
                    }
                });

                chrome.extension.sendMessage({msg: "api-call"});
            });

            var recipient = {},
                recipientAddress = "",
                similarRecipient = {},
                similarRecipientList = [];

            $("div.wO").on("DOMNodeInserted", function (e) {

                var matchLength = $(this).children(".vO").val().length;

                if ($(e.target).is("div.vR")) {

                    recipientAddress = $(e.target).find(".vN").attr("email");
                    var weight = 0;

                    $("div.ah.aiv.aJS div.am").each(function () {
                        if ($(this).children("div.ao5").length > 0) {
                            similarRecipient["name"] = $(this).children(".ao5").text();
                            similarRecipient["address"] = $(this).children(".Sr").text();
                        } else {
                            similarRecipient["name"] = "";
                            similarRecipient["address"] = $(this).text();
                        }
                        similarRecipient["email_name"] = "";
                        similarRecipient["email_domain"] = "";
                        similarRecipient["weight"] = ++weight;
                        similarRecipient["address_match_length"] = matchLength;
                        similarRecipient["name_match_length"] = matchLength;

                        similarRecipientList.push(similarRecipient);
                        similarRecipient = {};
                    });

                    recipient["address"] = recipientAddress;
                    recipient["name"] = "";
                    recipient["email_name"] = "";
                    recipient["email_domain"] = "";
                    recipient["recipient_type"] = 1;
                    recipient["weight"] = 14848;
                    recipient["similar_addresses"] = similarRecipientList;
                    recipient["similar_addresses_new_str"] = "";
                    recipient["similar_addresses_new"] = "";

                    recipientList[recipientAddress] = recipient;
                    similarRecipientList = [];
                    recipient = {};

                }
                //console.log(recipientList);
            });

            $("div.wO").on("DOMNodeRemoved", function (e) {

                if ($(e.target).is("div.vR")) {
                    recipientAddress = $(e.target).find(".vN").attr("email");
                    delete recipientList[recipientAddress];
                }
                //console.log(recipientList);
            });
        }
    },

    init: function () {
        var self = this;
        console.log("gmail manager initializing...");
    }
};

$(window).hashchange(function () {
    var hashcode = window.location.hash;
    if (hashcode.indexOf("?compose=") > -1) {
        gMailManager.addSendButtonEventHandler();
        console.log("Link bar timer logging ....");
    } else {
        gMailManager.eventInitialized = false;
    }
});

$("html").bind("keypress", function (e) {
    if (e.keyCode === 13 && e.ctrlKey) {
        return false;
    }
});

function jsonBuilder(recipientsData) {

    var recipients = [],
        tmpRecipient,
        weight = 0,
        rb_recipients = [];

    for(var recipientData in recipientsData){
        rb_recipients.push(recipientData);
        tmpRecipient = recipientsData[recipientData];
        tmpRecipient["weight"] = ++weight;
        recipients.push(tmpRecipient);
    }

    var jsonObj = {
        cr_action: "check_email",
        api_token: "b1b6f6938c96e3be0e42de3d61777015",
        username: "tom@quiversoftware.com",
        rb_username: "",
        user_domain: "quiversoftware.com",
        version: "1.5.1.9",
        device: "gmail",
        recipients: recipients,
        rb_recipients: rb_recipients,
        reply_to: " <7F651A1EJSIFF428B3239A37DF227959C544469@ldsexchange01.thoj.local>",
        num_attachments: 0,
        size_attachments: "0.0",
        sandpit_client: false,
        rules: "",
        email_type: "new_email",
        attachment_extensions: "",
        has_attachment: true,
        attachments: [{
            name: "Test document",
            extension: ".doc",
            attachment_words: ""
        }],
        subject_words: "",
        regex_filters_return: {}
    };

    var jsonStr = JSON.stringify(jsonObj);
    return jsonStr;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.msg) {
        case "api-response":
            data = request.data;
            gMailManager.displayApiResponse(data);
            break;

        default:
            break;
    }
});