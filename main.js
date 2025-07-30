let copiedPopupTime = 0;
let copiedPopupVisible = false;
let lastTime = 0;

function copyText(text) {
    navigator.clipboard.writeText(text);
    copiedPopupTime = lastTime + 5000;
}

window.addEventListener("DOMContentLoaded", () => {
    const copiedPopup = document.querySelector("#copied-popup");

    copiedPopup.addEventListener("mouseover", () => {
        copiedPopupTime = lastTime;
    })

    function frame(time) {
        lastTime = time;
        requestAnimationFrame(frame);

        if(copiedPopupTime > time) {
            if(!copiedPopupVisible) {
                copiedPopupVisible = true;
                copiedPopup.classList.add("show");
            }
        } else {
            if(copiedPopupVisible) {
                copiedPopupVisible = false;
                copiedPopup.classList.remove("show");
            }
        }
    }
    requestAnimationFrame(frame);

    document.querySelectorAll(".navlink").forEach(element => {
        element.addEventListener("click", e => {
            window.history.pushState(element.href, null, element.href);
            updatePage();
        })
    });

    window.addEventListener("popstate", () => {
        updatePage();
    })

    updatePage();
});

function updatePage() {
    const currentPage = document.location.hash.slice(1);

    if(currentPage == "") {
        showPage("home");
    } else {
        showPage(currentPage);
    }
}

function getPage(pageName) {
    for(const pageElement of Array.from(document.querySelectorAll(".page"))) {
        if(pageElement.dataset.name == pageName) return pageElement;
    }
    return null;
}

function showPage(pageName) {
    const page = getPage(pageName);

    document.querySelectorAll(".page").forEach(pageElement => {
        pageElement.hidden = true;
    });
    page.hidden = false;

    document.querySelectorAll(".navlink").forEach(navLink => {
        if(navLink.getAttribute("href").slice(1) == pageName) {
            navLink.classList.add("current");
        } else {
            navLink.classList.remove("current");
        }
    });

    page.querySelectorAll("img").forEach(img => {
        if("src" in img.dataset) {
            console.log("initiate loading ", img.dataset.src);
            img.loading = "lazy";
            img.src = img.dataset.src;
            delete img.dataset.src;
        }
    })
    page.querySelectorAll("iframe").forEach(iframe => {
        if("src" in iframe.dataset) {
            console.log("initiate loading ", iframe.dataset.src);
            iframe.src = iframe.dataset.src;
            delete iframe.dataset.src;
        }
    })

    if(page == null && pageName != "404") showPage("404");
    else if(pageName == "gallery") loadGallery();
}

let galleryImages;
async function loadGallery() {
    if(galleryImages != null) return;

    const gallery = getPage("gallery");
    const galleryContent = gallery.querySelector(".content");
    const loadMoreButton = gallery.querySelector(".load-more");
    
    let t0, t1, t2;
    t0 = performance.now();
    const images = galleryImages = await fetch("gallery/images.json").then(res => {
        t1 = performance.now();
        return res.json();
    });
    t2 = performance.now();
    const loadHighQualityImages = t2 - t1 < 1500;

    console.log("took " + (t2 - t1) + "ms to download" + (loadHighQualityImages ? " (so load higher quality images! :3)" : " (so don't load high quality images... :<)"));
    
    galleryContent.replaceChildren();

    
    images.files.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
    
    loadMoreButton.addEventListener("click", () => {
        const isMore = take();
        if(!isMore) {
            loadMoreButton.remove();
        }
    });
    loadMoreButton.addEventListener("focus", () => {
        loadMoreButton.scrollIntoView();
    });
    
    let index = 0;
    let imagesLeft = 0;
    function take(count = 9) {
        const files = images.files.slice(index, index + count);
        imagesLeft += files.length;
        index += count;
        
        const fullyLoaded = Promise.withResolvers();
        for(const source of files) {
            if(count == 0) break;
            count--;

            const element = document.createElement("div");
            element.classList.add("gallery-image");
            element.tabIndex = "0";

            element.addEventListener("focus", () => {
                element.scrollIntoView();
            });

            const contain = document.createElement("div");
            contain.classList.add("contain");

            const img = document.createElement("img");

            if(loadHighQualityImages) {
                let cb;
                img.addEventListener("load", cb = () => {
                    img.removeEventListener("load", cb);

                    imagesLeft--;
                    if(imagesLeft == 0) fullyLoaded.resolve();
                });
                fullyLoaded.promise.then(() => {
                    img.src = source.preview;
                })
            }

            img.src = source.loading;
            contain.append(img);

            const descriptionBox = document.createElement("div");
            descriptionBox.classList.add("description-box");

            source.description.push("$ " + source.width + "x" + source.height + " — Created on " + source.creationDate);
        
            for(let descriptionItem of source.description) {
                const p = document.createElement("p");
                
                let fontSize = 1.5;
                while(descriptionItem[0] == "-") {
                    descriptionItem = descriptionItem.slice(1);
                    fontSize -= 0.25;
                    p.style.fontSize = fontSize + "rem";
                }
                if(descriptionItem[0] == "$") {
                    descriptionItem = descriptionItem.slice(1);
                    p.classList.add("minor");
                }
                p.textContent = descriptionItem;
                descriptionBox.append(p);
            }

            contain.append(descriptionBox);

            element.append(contain);
            galleryContent.append(element);

            element.addEventListener("click", () => {
                window.open(source.file, "_blank");
            });
            element.addEventListener("keypress", event => {
                if(["enter", " "].includes(event.key.toLowerCase())) {
                    event.preventDefault();
                    window.open(source.file, "_blank");
                }
            })
        }

        galleryContent.append(loadMoreButton);

        if(index >= images.files.length) return false;
        return true;
    }
    
    take();
}