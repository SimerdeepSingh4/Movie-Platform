import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import MovieRow from '../../home/components/MovieRow';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '@/lib/api';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const PersonDetails = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const fetchPersonDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${BASE_URL}/person/${id}?api_key=${TMDB_API_KEY}&append_to_response=combined_credits,external_ids`
      );
      setPerson(res.data);
    } catch (err) {
      setError("Failed to load person details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPersonDetails();
    }
    window.scrollTo(0, 0);
  }, [id, fetchPersonDetails]);

  useEffect(() => {
    if (person && user) {
      // Track watch history
      const trackHistory = async () => {
        try {
          await api.post('/user/history', {
            tmdbId: Number(id),
            mediaType: 'person',
            action: 'opened',
            source: 'tmdb'
          });
        } catch (err) {
          console.error("Failed to track history:", err);
        }
      };
      trackHistory();
    }
  }, [person, user, id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row gap-12">
          <Skeleton className="w-full md:w-[350px] aspect-[2/3] rounded-2xl" />
          <div className="flex-1 space-y-6">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-xl text-destructive font-semibold">{error || "Person not found"}</div>
      </div>
    );
  }

  const sortedCredits = person.combined_credits?.cast
    ?.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 20) || [];

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
      <div className="flex flex-col md:flex-row gap-12 mb-16">
        {/* Profile Info Sidebar */}
        <div className="w-full md:w-[350px] shrink-0">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card mb-8">
            <img 
              src={person.profile_path ? `https://image.tmdb.org/t/p/h632${person.profile_path}` : 'https://ik.imagekit.io/dhyh95euj/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'} 
              alt={person.name}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="space-y-6 p-2">
            <h3 className="text-xl font-bold border-b pb-2">Personal Info</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Known For</p>
                <p className="text-md font-medium">{person.known_for_department}</p>
              </div>

              {person.birthday && (
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Birthday</p>
                  <p className="text-md font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {person.birthday}
                  </p>
                </div>
              )}

              {person.place_of_birth && (
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Place of Birth</p>
                  <p className="text-md font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {person.place_of_birth}
                  </p>
                </div>
              )}

              {person.also_known_as?.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Also Known As</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {person.also_known_as.slice(0, 3).map((name, i) => (
                      <Badge key={i} variant="outline" className="bg-muted/30">{name}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Biography & Credits */}
        <div className="flex-1 space-y-10 min-w-0">
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-8 text-foreground">
              {person.name}
            </h1>
            
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-primary">
              Biography
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {person.biography || `We don't have a biography for ${person.name} yet.`}
            </p>
          </div>

          {sortedCredits.length > 0 && (
            <div className="w-full overflow-hidden">
               <MovieRow title="Known For" movies={sortedCredits} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonDetails;
