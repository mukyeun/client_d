export const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

export const validateSearchTerm = (term) => {
  return term && term.trim().length > 0;
};

export const formatSearchResults = (results) => {
  return results.map(result => ({
    ...result,
    reservationDate: new Date(result.reservationDate).toISOString()
  }));
}; 