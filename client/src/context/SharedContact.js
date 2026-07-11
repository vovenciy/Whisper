let CurrentContact = {name: '', FriendshipToken: '0', ChatId: '0'}
if (sessionStorage.getItem('CurrentContact')!=null) {
    CurrentContact = sessionStorage.getItem('CurrentContact')
}
export const SharedContact = {
    get() {
        return CurrentContact
    },
    update(value) {
        CurrentContact = value
        sessionStorage.setItem('CurrentContact', value)
    }
}