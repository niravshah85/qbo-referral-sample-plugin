// qboXDMReady method will be called when qboXDM object becomes available
// i.e. when data from the parent frame (QBO) is available to consume
var qboXDMReady = function () {
    
};

var qboXDMReceiveMessage = function (message, successFn, errorFn) {
    if (message === "item-save-button-clicked") {
        // save item and call lettuce api and call the following code on success handler of the xhr request
        // if xhr errors out, show the error msg. I don't think we need to notify QBO of that since Lettuce
        // iframe needs to handle that
        console.error(message);
        
        // call successFn with data of the item created
        successFn({
            data: {
                id: 21 // this should be quickbooks_id of the item
            }            
        });
                
    } else if (message === "item-cancel-button-clicked") {
        // do something on cancel button click if needed
        console.error(message);
        successFn();
    }
    
}