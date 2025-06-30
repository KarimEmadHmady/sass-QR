import { useAppSelector, useAppDispatch } from './hooks';
import { setSubdomain, setIsMainDomain, initializeSubdomain } from './subdomainSlice';

export const useSubdomain = () => {
  const dispatch = useAppDispatch();
  const subdomain = useAppSelector((state) => state.subdomain);

  const setSubdomainData = (subdomain: string | null) => {
    dispatch(setSubdomain(subdomain));
  };

  const setIsMainDomainData = (isMainDomain: boolean) => {
    dispatch(setIsMainDomain(isMainDomain));
  };

  const initializeSubdomainData = () => {
    dispatch(initializeSubdomain());
  };

  return {
    ...subdomain,
    setSubdomain: setSubdomainData,
    setIsMainDomain: setIsMainDomainData,
    initializeSubdomain: initializeSubdomainData,
  };
}; 