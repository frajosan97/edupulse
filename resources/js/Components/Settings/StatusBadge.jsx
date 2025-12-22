import { Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * StatusBadge component for displaying active/inactive status
 * @param {object} props - Component props
 * @param {boolean} props.active - Whether the status is active
 * @param {string} [props.activeText='Active'] - Text for active state
 * @param {string} [props.inactiveText='Inactive'] - Text for inactive state
 * @param {string} [props.activeVariant='success'] - Bootstrap variant for active state
 * @param {string} [props.inactiveVariant='secondary'] - Bootstrap variant for inactive state
 * @param {string} [props.className=''] - Additional className
 * @returns {JSX.Element} Status badge component
 */
const StatusBadge = ({
    active,
    activeText = 'Active',
    inactiveText = 'Inactive',
    activeVariant = 'success',
    inactiveVariant = 'secondary',
    className = ''
}) => {
    return (
        <Badge
            bg={active ? activeVariant : inactiveVariant}
            className={className}
        >
            {active ? activeText : inactiveText}
        </Badge>
    );
};

StatusBadge.propTypes = {
    active: PropTypes.bool.isRequired,
    activeText: PropTypes.string,
    inactiveText: PropTypes.string,
    activeVariant: PropTypes.string,
    inactiveVariant: PropTypes.string,
    className: PropTypes.string
};

export default StatusBadge;