export function doCoordinatesCrossAntimeridian(coordinates) {
  let hasPositive = false;
  let hasNegative = false;

  coordinates.forEach(function (polygon) {
    polygon.forEach(function (ring) {
      ring.forEach(function (coordinate) {
        if (coordinate[0] >= 180) {
          hasPositive = true;
        }
        if (coordinate[0] <= -180) {
          hasNegative = true;
        }
      });
    });
  });

  return hasPositive && hasNegative;
}

export function coordinatesNormalization(coordinates, ignoreDuplicates = false) {
  return coordinates.map((polygon) => {
    const ringsArray = [];

    polygon.forEach((ring) => {
      const originalCoordinates = [];
      const duplicatedCoordinates = [];

      ring.forEach((coordinate) => {
        const [longitude, latitude] = coordinate;
        const normalizedCoordinate = [longitude < 0 ? longitude + 360 : longitude, latitude];
        originalCoordinates.push(longitude < 0 ? [...normalizedCoordinate] : coordinate);

        if (!ignoreDuplicates) {
          const invertedCoordinate = [longitude > 0 ? longitude - 360 : longitude, latitude];
          duplicatedCoordinates.push([...invertedCoordinate]);
        }
      });

      ringsArray.push(originalCoordinates, duplicatedCoordinates);
    });

    return ringsArray;
  });
}

export function arePrevResultsAlreadyInTheList(prevSearchResults, searchResults) {
  return prevSearchResults?.every((prevResult) =>
    searchResults?.find((result) => result.id === prevResult.id),
  );
}

export function manipulateODataSearchResultsWithAntimeridianDuplicates(prevSearchResults, searchResult) {
  if (!searchResult) {
    return null;
  }

  let prevAllResultsFromOdataSearchResults = undefined;

  if (arePrevResultsAlreadyInTheList(prevSearchResults, searchResult)) {
    if (prevSearchResults.length < searchResult.length) {
      // removes already processed data out of searchResults array
      prevAllResultsFromOdataSearchResults = [...searchResult].splice(0, prevSearchResults.length);
    } else {
      return searchResult;
    }
  }

  const updatedSearchResults = searchResult.map((data) => {
    let dataCopy = { ...data };
    dataCopy.geometry = { ...data.geometry };
    //Checks for coordinates that are crossing antimeridian
    if (
      dataCopy.geometry?.type === 'MultiPolygon' &&
      doCoordinatesCrossAntimeridian(dataCopy.geometry?.coordinates)
    ) {
      dataCopy.geometry.coordinates = coordinatesNormalization(dataCopy.geometry.coordinates);
    }
    return dataCopy;
  });

  // combines new array with old results
  if (prevAllResultsFromOdataSearchResults?.length > 0) {
    updatedSearchResults.unshift(...prevAllResultsFromOdataSearchResults);
  }

  return updatedSearchResults;
}
