import React, { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { UserAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { arrayUnion, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import YouTube from 'react-youtube';
import movieTrailer from 'movie-trailer';

const Movie = ({ item }) => {
  const [like, setLike] = useState(false);
  const [saved, setSaved] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState('');
  const { user } = UserAuth();

  const movieID = doc(db, 'users', `${user?.email}`);
  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 1,
    },
  };

  const handleClick = (movie) => {
    if (trailerUrl) {
      console.log('ho');
      setTrailerUrl('');
    } else {
      movieTrailer(movie?.name || '')
        .then((url) => {
          console.log(url);
          const urlParams = new URLSearchParams(new URL(url).search);
          setTrailerUrl(urlParams.get('v'));
        })
        .catch((error) => console.log(error));
    }
  };

  const saveShow = async () => {
    if (user?.email) {
      setLike(!like);
      setSaved(true);
  
      // Check if the document exists
      const docSnap = await getDoc(movieID);
  
      if (docSnap.exists()) {
        // If the document exists, update it
        await updateDoc(movieID, {
          savedShows: arrayUnion({
            id: item.id,
            title: item.title,
            img: item.backdrop_path,
          }),
        });
      } else {
        // If the document doesn't exist, create it first and then update
        await setDoc(movieID, {
          savedShows: [
            {
              id: item.id,
              title: item.title,
              img: item.backdrop_path,
            },
          ],
        });
      }
    } else {
      alert('Please log in to save a movie');
    }
  };

  // console.log(item);
  

  return (
    <div className='w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px] inline-block cursor-pointer relative p-2'>
      <img
        className='w-full h-auto block'
        src={`https://image.tmdb.org/t/p/w500/${item?.backdrop_path}`}
        alt={item?.title}
        onClick={() => handleClick(item)}
      />
      {trailerUrl && <YouTube videoId={trailerUrl} opts={opts} />}
      <div className='absolute top-0 left-0 w-full h-full hover:bg-black/80 opacity-0 hover:opacity-100 text-white'>
        <p className='white-space-normal text-xs md:text-sm font-bold flex justify-center items-center h-full text-center'>
          {item?.title}
        </p>
        <p onClick={saveShow}>
          {like ? (
            <FaHeart className='absolute top-4 left-4 text-gray-300' />
          ) : (
            <FaRegHeart className='absolute top-4 left-4 text-gray-300' />
          )}
        </p>
      </div>
    </div>
  );
};

export default Movie;
