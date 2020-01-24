export default class Likes {
    constructor() {
        this.likes = [];
    }

    addLike(id, title, author, img) { 
        const like = {id, title, author, img};
        this.likes.push(like);

        //Persist data in local storage when we add a like
        this.persistData();
        return like;
    }

    deleteLike(id) {
        const index = this.likes.findIndex(el => el.id ===id);
        this.likes.splice(index, 1);

        //persist data when we delete a like
        
        this.persistData();
        
    }

    isLiked(id) { //when we hit the like button
        return this.likes.findIndex(el => el.id === id) !==-1;
    }

    getNumLikes() {
        return this.likes.length;
    }

    persistData() {
        localStorage.setItem('likes', JSON.stringify(this.likes));
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('likes'));
        
        //Restoring likes from the localstorage 
        if (storage) {
            this.likes = storage;
        }
    }
}