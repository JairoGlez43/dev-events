'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormField from './FormField';

interface FormData {
  title: string;
  description: string;
  overview: string;
  image: FileList | null;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  organizer: string;
  tags: string[];
  agenda: string[];
}

const Form = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      overview: '',
      venue: '',
      location: '',
      date: '',
      time: '',
      mode: 'Online',
      audience: '',
      organizer: '',
      tags: [''],
      agenda: [''],
    }
  });

  const tags = watch('tags');
  const agenda = watch('agenda');

  const handleArrayChange = (field: 'tags' | 'agenda', index: number, value: string) => {
    const currentArray = watch(field);
    const newArray = [...currentArray];
    newArray[index] = value;
    setValue(field, newArray);
  };

  const addArrayItem = (field: 'tags' | 'agenda') => {
    const currentArray = watch(field);
    setValue(field, [...currentArray, '']);
  };

  const removeArrayItem = (field: 'tags' | 'agenda', index: number) => {
    const currentArray = watch(field);
    if (currentArray.length > 1) {
      setValue(field, currentArray.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!data.image) {
        throw new Error('Image is required');
      }

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('overview', data.overview);
      formData.append('image', data.image[0]);
      formData.append('venue', data.venue);
      formData.append('location', data.location);
      formData.append('date', data.date);
      formData.append('time', data.time);
      formData.append('mode', data.mode);
      formData.append('audience', data.audience);
      formData.append('organizer', data.organizer);
      formData.append('tags', JSON.stringify(data.tags.filter(tag => tag.trim())));
      formData.append('agenda', JSON.stringify(data.agenda.filter(item => item.trim())));

      const response = await fetch('/api/events', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      setSuccess('Event created successfully!');

      // Reset form
      setValue('title', '');
      setValue('description', '');
      setValue('overview', '');
      setValue('venue', '');
      setValue('location', '');
      setValue('date', '');
      setValue('time', '');
      setValue('mode', 'Online');
      setValue('audience', '');
      setValue('organizer', '');
      setValue('tags', ['']);
      setValue('agenda', ['']);

      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="event-form">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-section">
        <h3>Basic Information</h3>

        <FormField
          label="Event Title"
          name="title"
          placeholder="Enter event title"
          register={register}
          error={errors.title?.message}
        />

        <FormField
          label="Overview"
          name="overview"
          type="textarea"
          placeholder="Brief overview of your event"
          register={register}
          error={errors.overview?.message}
        />

        <FormField
          label="Description"
          name="description"
          type="textarea"
          placeholder="Detailed description of your event"
          register={register}
          error={errors.description?.message}
        />
      </div>

      <div className="form-section">
        <h3>Event Details</h3>

        <div className="form-row">
          <FormField
            label="Venue"
            name="venue"
            placeholder="Event venue"
            register={register}
            error={errors.venue?.message}
          />

          <FormField
            label="Location"
            name="location"
            placeholder="City, Country"
            register={register}
            error={errors.location?.message}
          />
        </div>

        <div className="form-row">
          <FormField
            label="Date"
            name="date"
            type="date"
            register={register}
            error={errors.date?.message}
          />

          <FormField
            label="Time"
            name="time"
            type="time"
            register={register}
            error={errors.time?.message}
          />
        </div>

        <div className="form-row">
          <FormField
            label="Mode"
            name="mode"
            type="select"
            register={register}
            error={errors.mode?.message}
          />

          <FormField
            label="Target Audience"
            name="audience"
            placeholder="Who is this event for?"
            register={register}
            error={errors.audience?.message}
          />
        </div>

        <FormField
          label="Organizer"
          name="organizer"
          placeholder="Organization or person organizing"
          register={register}
          error={errors.organizer?.message}
        />
      </div>

      <div className="form-section">
        <h3>Media & Tags</h3>

        <div className="form-field">
          <label htmlFor="image">
            Event Image
            <span className="required">*</span>
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            {...register('image', {
              required: 'Image is required',
            })}
            className="file-input"
          />
          {watch('image') && (
            <p className="file-selected">{(watch('image') as FileList)?.[0]?.name}</p>
          )}
          {errors.image && <span className="error">{errors.image.message}</span>}
        </div>

        <FormField
          label="Tags"
          name="tags"
          type="array"
          placeholder="Add event tags"
          value={tags}
          onArrayChange={(index, value) => handleArrayChange('tags', index, value)}
          onAddArrayItem={() => addArrayItem('tags')}
          onRemoveArrayItem={(index) => removeArrayItem('tags', index)}
        />
      </div>

      <div className="form-section">
        <h3>Agenda</h3>

        <FormField
          label="Agenda Items"
          name="agenda"
          type="array"
          placeholder="Add agenda items"
          value={agenda}
          onArrayChange={(index, value) => handleArrayChange('agenda', index, value)}
          onAddArrayItem={() => addArrayItem('agenda')}
          onRemoveArrayItem={(index) => removeArrayItem('agenda', index)}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating Event...' : 'Create Event'}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default Form;
