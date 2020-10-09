import QtQuick 2.12
import QtQuick.Window 2.12
import QtQuick.Controls 2.5

Popup {
    id: popup
    topPadding: 0
    rightPadding: 0
    bottomPadding: 0
    leftPadding: 0
    modal: true
    focus: true
    closePolicy: Popup.CloseOnEscape
    visible: frontendHandler.checkForEmptyTable() ? true : false

    background: Rectangle {
        anchors.fill: parent
        color: "#F1F3FA"
    }
    

    Text {
        id: startupPageHeader
        text: qsTr("ERSTELLE DEIN ERSTES VOKABELPACKET")
        font.pointSize: 22.5
        font.underline: true
        anchors.top: parent.top
        anchors.horizontalCenter: parent.horizontalCenter
    }

    AddLanguagePackage {
        id: addLanguagePackage
        width: parent.width * 0.8
        height: parent.height * 0.8
        anchors.top: startupPageHeader.bottom
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.topMargin: 80

    }
    

}