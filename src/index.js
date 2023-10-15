// Import modulele necesare.
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// Selectez elementele HTML de interes.
const form = document.querySelector('.search-form');
const input = form.querySelector('input[type="text"]');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

// Folosesc cheia API pentru serviciul Pixabay.
const apiKey = '40063941-d21e853174aec231e07e7c8ff';

// Stabilesc variabile pentru gestionarea paginării și stării căutării.
let page = 1;
let currentSearch = '';
let isFirstSearch = true; // Initializez isFirstSearch cu true

// Inițializez Lightbox pentru a afișa imagini la un simplu clic.
const lightbox = new SimpleLightbox('.gallery a');

// Ascult evenimentul de clic pe butonul "Load More" pentru a încărca mai multe imagini.
loadMoreButton.addEventListener('click', loadMoreImages);

// Ascult evenimentul de trimitere a formularului pentru a efectua căutarea.
form.addEventListener('submit', searchImages);

// Funcția pentru gestionarea căutării de imagini.
async function searchImages(e) {
  e.preventDefault();
  currentSearch = input.value; // Obțineți termenul de căutare introdus.
  page = 1; // Resetez pagina la 1 pentru o nouă căutare.
  isFirstSearch = true; // Ma asigur ca isFirstSearch este true la fiecare cautare
  clearGallery(); // Sterg imaginile anterioare
  await fetchImages(); // Apelează funcția pentru a obține imagini noi.
  input.value = ''; // Resetez câmpul de introducere a căutării după căutare.
}

// Funcția pentru încărcarea mai multor imagini.
async function loadMoreImages() {
  page++;
  await fetchImages();
  isFirstSearch = false; // Setez isFirstSearch cu false pentru a nu aparea mesajul de succes
}

// Funcția pentru ștergerea imaginilor din galerie.
function clearGallery() {
  gallery.innerHTML = ''; // Golește conținutul galeriei.
  loadMoreButton.style.display = 'none'; // Ascunde butonul "Load More".
}

// Funcția pentru obținerea imaginilor de la API.
async function fetchImages() {
  const perPage = 40; // Numărul de imagini afișate pe pagină.
  const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${currentSearch}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Afișez mesajul de succes pentru prima căutare cu numărul total de imagini.
    if (isFirstSearch && data.hits.length > 0) {
      Notiflix.Report.success(
        'Hooray!',
        `I found ${data.total} images.`,
        'Close'
      );
      isFirstSearch = false;
    }

    // Afișez mesaj de eroare dacă nu există rezultate.
    if (data.hits.length === 0) {
      Notiflix.Report.failure(
        'Sorry',
        'There are no images matching your search query. Please try again.',
        'Try Again'
      );
      return;
    }

    // Afișez imaginile în galerie.
    data.hits.forEach(image => {
      const card = createImageCard(image);
      gallery.appendChild(card);
    });

    // Afișez sau ascund butonul "Load More" în funcție de disponibilitatea mai multor imagini.
    if (data.total > page * perPage) {
      loadMoreButton.style.display = 'block';
    } else {
      loadMoreButton.style.display = 'none';
      // Afișez mesajul de informare la sfârșitul rezultatelor.
      if (page > 1) {
        Notiflix.Report.info(
          "I'm sorry",
          "You've reached the end of search results.",
          'Close'
        );
      }
    }

    // Reîmprospătez Lightbox pentru noile imagini.
    lightbox.refresh();
  } catch (error) {
    console.error(error);
  }
}

// Funcția pentru crearea cardurilor de imagine.
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
  img.classList.add('image');

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
