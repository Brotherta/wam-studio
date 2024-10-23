/// <reference lib="esnext" />
/// <reference lib="webworker" />


let workerId=0

addEventListener('message', async (event) => {
    
    if("workerId" in event.data){
        workerId = event.data.workerId
    }

    if("task" in event.data){
        
    }

    if("promise_resolve_id_send" in event.data){
        postMessage({"promise_resolve_id": event.data.promise_resolve_id_send})
    }
})