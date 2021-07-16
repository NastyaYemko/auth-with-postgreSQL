module.exports = class UserDto {
    first_name;
    last_name;
    email;
    phone;
    id;

    constructor(model) {
        this.first_name = model.first_name;
        this.last_name = model.last_name;
        this.email = model.email;
        this.phone = model.phone;
        this.id = model.id;
    }
}
