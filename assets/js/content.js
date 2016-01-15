var gmail = null,
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
            $sendButton = $(".T-I.J-J5-Ji.aoO.T-I-atl.L3")
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
            $modalTitleInput = $("<input/>", {
                class: "form-control",
                id: "check-recipient-title"
            }),
            $modalTitleLabel = $("<label/>", {
                for: "check-recipient-title"
            }).text("Title"),
            $modalEmailinput = $("<input/>", {
                class: "form-control",
                id: "check-recipient-address"
            }),
            $modalEmailLabel = $("<label/>", {
                for: "check-recipient-address"
            }).text("Recipient Address"),
            $modalSubjectInput = $("<input/>", {
                class: "form-control",
                id: "check-recipient-subject"
            }),
            $modalSubjectLabel = $("<label/>", {
                for: "check-recipient-subject"
            }).text("Subject"),
            $modalAutocompleteInput = $("<input/>", {
                class: "form-control",
                id: "check-recipient-autocomplete"
            }),
            $modalAutocompleteLabel = $("<label/>", {
                for: "check-recipient-autocomplete"
            }).text("Autocomplete"),
            $modalFooter = $("<div/>", {class: "modal-footer"}),
            $modalBackButton = $("<button/>", {
                class: "btn btn-default",
                "data-dismiss": "modal"
            }).text("Back"),
            $modalSendButton = $("<button/>", {
                class: "btn btn-primary",
                id: "modal-send"
            }).text("Send").prop("disabled", true);

        $("<div/>", {class: "form-group"}).append($modalTitleLabel, $modalTitleInput).appendTo($modalBody);
        $("<div/>", {class: "form-group"}).append($modalEmailLabel, $modalEmailinput).appendTo($modalBody);
        $("<div/>", {class: "form-group"}).append($modalSubjectLabel, $modalSubjectInput).appendTo($modalBody);
        $("<div/>", {class: "form-group"}).append($modalAutocompleteLabel, $modalAutocompleteInput).appendTo($modalBody);

        $modalFooter.append($modalBackButton, $modalSendButton);
        $modalContent.append($modalHeader, $modalBody, $modalFooter).appendTo($modalDialog);
        $modal.append($modalDialog).appendTo($body);

        $modalSendButton.click(function () {
            $sendButton.click();
            $modalBackButton.click();
        })
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

                var autocompleteList = [];
                $("div.ah.aiv.aJS div.am").each(function(){
                    autocompleteList.push($(this).text());
                });

                $("#check-recipient-xt-modal #check-recipient-address").val(email);
                $("#check-recipient-xt-modal #check-recipient-subject").val(subject);
                $("#check-recipient-xt-modal #check-recipient-autocomplete").val(autocompleteList.join(", "));
                $("#check-recipient-xt-modal").modal();
                $("#check-recipient-xt-modal #modal-send").prop("disabled", true);
                chrome.extension.sendMessage({msg: "api-call"});
            });
        }
    },

    init: function () {
        var self = this;
        console.log("gmail manager initializing...");
    }
};

$(document).ready(function () {
    console.log("Hello");

    if (window.location.hash.indexOf("?compose=") > -1) {
        var sendButtonTimer = setInterval(function () {
            if ($("div.AD table.iN .aoX").length > 0) {
                gMailManager.addSendButtonEventHandler();
                console.log("Link bar timer logging....");
                clearInterval(sendButtonTimer);
            }
        }, 500);
    }

    $(window).hashchange(function () {
        var hashcode = window.location.hash;
        if (hashcode.indexOf("?compose=") > -1) {
            gMailManager.addSendButtonEventHandler();
        } else {
            gMailManager.eventInitialized = false;
        }
    });

    $('html').bind('keypress', function (e) {
        if (e.keyCode === 13 && e.ctrlKey) {
            return false;
        }
    });

});

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