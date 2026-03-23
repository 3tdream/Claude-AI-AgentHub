---
name: backup-plan
description: Create backup and disaster recovery strategy — data, config, restore procedures
argument-hint: <"full" or specific component>
---

Backup & disaster recovery plan.

## DATA INVENTORY
| Data | Location | Size Est. | Change Rate | Critical? |
|------|----------|-----------|-------------|-----------|
| Database | PostgreSQL | | | Yes |
| File storage | data/*.json | | | Yes |
| Config | .env, settings | | | Yes |
| Logs | data/logs.json | | | No |

## BACKUP STRATEGY
| Data | Method | Frequency | Retention | Location |
|------|--------|-----------|-----------|----------|
| Database | pg_dump | Daily | 30 days | S3/GCS |
| Files | rsync/cp | Daily | 14 days | S3/GCS |
| Config | git | On change | Forever | Git repo |

## RESTORE PROCEDURES

### Database Restore
```bash
# Steps to restore from backup
```

### File Restore
```bash
# Steps to restore data files
```

### Full System Recovery
1. Provision new infrastructure
2. Restore database from latest backup
3. Deploy application from git
4. Restore data files
5. Verify health checks pass
6. Update DNS/load balancer

## RPO & RTO
- **RPO** (Recovery Point Objective): max data loss acceptable = X hours
- **RTO** (Recovery Time Objective): max downtime acceptable = X hours

## TESTING
- [ ] Test restore from backup quarterly
- [ ] Document restore time (actual vs target RTO)
- [ ] Verify data integrity after restore
