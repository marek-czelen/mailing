export class Response{
    response={success: false, message: ""};
    data=null
    constructor (data, success=false, message=""){
        this.response.success=success;
        this.response.message=message;
        this.data=data;
    }

}

export default{Response}