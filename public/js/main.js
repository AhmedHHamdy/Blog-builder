const deleteBlog = document.querySelectorAll('.fa-trash');
const thumbBlog = document.querySelectorAll('.fa-thumbs-up')

Array.from(deleteBlog).forEach((element) => {
  element.addEventListener('click', deleteBlogs);
});

Array.from(thumbBlog).forEach((element) => {
    element.addEventListener('click', addLike)
})

async function deleteBlogs() {
    const article = this.closest('article') //  the closest method is used to find the nearest ancestor element matching the <article> tag. 
    const titleBlog = article.querySelector('h3').innerText
    const descBlog =  article.querySelector('p').innerText

    try {
        const response = await fetch('deleteBlog', {
            method: 'delete',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                'titleBlog': titleBlog,
                'descBlog': descBlog
            })
        })

        const data = await response.json()
        console.log(data)
        location.reload()

    } catch(err) {
        console.log(err)
    }
}


async function addLike() {
    const article = this.closest('article')
    const titleBlog = article.querySelector('h3').innerText
    const descBlog = article.querySelector('p').innerText
    const likesBlog = Number(article.querySelector('div span').innerText)
    try {
        const response = await fetch('addOneLike', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                'titleBlog': titleBlog,
                'descBlog': descBlog,
                'likesBlog': likesBlog
            })
        })

        const data = await response.json()
        console.log(data)
        location.reload()

    }catch(err){
        console.log(err)
    }
}