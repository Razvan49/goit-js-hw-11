import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const input = form.querySelector('input[type="text"]');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

const apiKey = '40063941-d21e853174aec231e07e7c8ff'; // Înlocuiți cu cheia API reală
let page = 1;
let currentSearch = '';
let isFirstSearch = true; // Verificare pentru prima căutare

const lightbox = new SimpleLightbox('.gallery a');

loadMoreButton.addEventListener('click', loadMoreImages);
form.addEventListener('submit', searchImages);

async function searchImages(e) {
  e.preventDefault();
  currentSearch = input.value;
  page = 1;
  clearGallery();
  await fetchImages();
  input.value = '';
}

async function loadMoreImages() {
  page++;
  await fetchImages();
}

function clearGallery() {
  gallery.innerHTML = '';
  loadMoreButton.style.display = 'none';
}

async function fetchImages() {
  const perPage = 40;
  const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${currentSearch}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (isFirstSearch && data.hits.length > 0) {
      Notiflix.Report.success(
        'Hooray!',
        `We found ${data.totalHits} images.`,
        'Close'
      );
      isFirstSearch = false;
    }

    if (data.hits.length === 0) {
      Notiflix.Report.failure(
        'Sorry',
        'There are no images matching your search query. Please try again.',
        'Try Again'
      );
      return;
    }

    data.hits.forEach(image => {
      const card = createImageCard(image);
      gallery.appendChild(card);
    });

    if (data.totalHits > page * perPage) {
      loadMoreButton.style.display = 'block';
    } else {
      loadMoreButton.style.display = 'none';
      Notiflix.Report.info(
        "We're sorry",
        "You've reached the end of search results.",
        'Close'
      );
    }

    lightbox.refresh();
  } catch (error) {
    console.error(error);
  }
}

function createImageCard(image) {
  const card = document.createElement('div');
  card.classList.add('photo-card');

  const imgLink = document.createElement('a');
  imgLink.href = image.largeImageURL;
  imgLink.title = image.tags;

  const img = document.createElement('img');
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = 'lazy';

  const info = document.createElement('div');
  info.classList.add('info');
  info.innerHTML = `
      <p class="info-item"><b>Likes:</b> ${image.likes}</p>
      <p class="info-item"><b>Views:</b> ${image.views}</p>
      <p class="info-item"><b>Comments:</b> ${image.comments}</p>
      <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
    `;

  imgLink.appendChild(img);
  card.appendChild(imgLink);
  card.appendChild(info);

  return card;
}
